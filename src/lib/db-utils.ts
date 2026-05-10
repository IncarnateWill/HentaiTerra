import { connectToDatabase } from './mongodb';
import { Anime, Episode, Genre, User, Watchlist } from '@/models';
import { IEpisode }from '@/models/types';
import mongoose, { Types } from 'mongoose';
import { cache } from 'react';
import { logToDiscordWebhook } from './discord-webhook';
import { getCachedData, setCachedData } from './redis';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // ISR every 60 seconds

// Map to track in-flight requests to prevent cache stampede
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Helper to handle cache-aside pattern with stampede protection (mutex)
 */
async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    const cached = await getCachedData<T>(key);
    if (cached) return cached;

    // Check if there's already an in-flight request for this key
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    // Create a new request and store it in the map
    const request = (async () => {
        try {
            const data = await fetcher();
            await setCachedData(key, data, ttl);
            return data;
        } finally {
            // Remove from map once done (success or failure)
            pendingRequests.delete(key);
        }
    })();

    pendingRequests.set(key, request);
    return request;
}

// Utility function to validate MongoDB ObjectId
export const isValidObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Utility function to safely handle ObjectId validation with logging
export const validateObjectId = (id: string, context: string): boolean => {
    const isValid = isValidObjectId(id);
    if (!isValid) {
        logToDiscordWebhook(`Invalid ObjectId in ${context}: "${id}"`).catch(err => 
            console.error('Failed to log validation error to Discord:', err)
        );
    }
    return isValid;
};


// Using Next.js built-in caching for performance
export const getRecentEpisodes = cache(
    async (limit: number = 6) => {
        const cacheKey = `recent_episodes_${limit}`;
        
        return fetchWithCache(cacheKey, async () => {
            await connectToDatabase();
            
            const episodes = await Episode.find()
                .sort({ releaseDate: -1 })
                .limit(limit)
                .select('episodeId episodeNumber animeId releaseDate thumbnail displayTitle isCensored')
                .populate({
                    path: 'animeId',
                    select: 'name poster mediaType status censorship',
                })
                .lean()
                .then(episodes => {
                    return episodes.filter(ep => ep.animeId);
                });
            
            return episodes;
        }, 300); // 5 minutes
    }
);


export const getPopularAnime = cache(
    async (limit: number = 10) => {
        const cacheKey = `popular_anime_${limit}`;
        
        return fetchWithCache(cacheKey, async () => {
            await connectToDatabase();
            const result = await Anime.aggregate([
                // Optimized genre population with limited fields
                {
                    $lookup: {
                        from: 'genres',
                        let: { genreIds: '$genres' },
                        pipeline: [
                            { $match: { $expr: { $in: ['$_id', '$$genreIds'] } } },
                            { $project: { name: 1 } },
                            { $limit: 10 } // Limit genres to reduce payload
                        ],
                        as: 'genres'
                    }
                },
                
                // Optimized episode lookup with only views field
                {
                    $lookup: {
                        from: 'episodes',
                        let: { animeId: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$animeId', '$$animeId'] } } },
                            { $project: { views: 1 } }
                        ],
                        as: 'episodes'
                    }
                },
                
                { $addFields: { 
                    totalViews: { $sum: "$episodes.views" } 
                }},
                { $sort: { totalViews: -1 } },
                { $limit: limit },
                { $project: { 
                    name: 1,
                    poster: 1,
                    description: 1,
                    genres: 1
                }}
            ]);
            
            return result;
        }, 3600); // 1 hour
    }
);



export const getRecentAnimes = cache(
    async (limit: number = 6) => {
        const cacheKey = `recent_animes_${limit}`;
        
        return fetchWithCache(cacheKey, async () => {
            await connectToDatabase();
            const animes = await Anime.find({ mediaType: 'anime' }) // Filter for anime only
                .sort({ createdAt: -1 }) // Sort by creation date to show newest anime first
                .limit(limit)
                .select('name poster status censorship') // Include status and censorship for badge rendering
                .lean();
            
            return animes;
        }, 600); // 10 minutes
    }
);


export const getRecentMovies = cache(
    async (limit: number = 6) => {
        const cacheKey = `recent_movies_${limit}`;
        
        return fetchWithCache(cacheKey, async () => {
            await connectToDatabase();
            const movies = await Anime.find({ mediaType: 'movie' }) // Ensures only movies are fetched
                .sort({ createdAt: -1 }) // Sort by creation date to show newest movies first
                .limit(limit)
                .select('name poster status') // Include status even for movies (future use)
                .lean();    
            
            return movies;
        }, 600); // 10 minutes
    }
);

export const getAnimeDetails = cache(
    async (id: string, page = 1, perPage = 24) => {
        const cacheKey = `anime_details_${id}_${page}_${perPage}`;

        // Validate ObjectId before making database query
        if (!validateObjectId(id, 'getAnimeDetails')) {
            console.error(`Invalid anime ID provided to getAnimeDetails: ${id}`);
            return null;
        }

        return fetchWithCache(cacheKey, async () => {
            await connectToDatabase();

            try {
                const skip = (page - 1) * perPage;

                const anime = await Anime.findById(id)
                    .populate({
                        path: 'episodes',
                        options: {
                            sort: { episodeNumber: 1 },
                            skip: skip,
                            limit: perPage
                        }
                    })
                    .populate({
                        path: 'genres',
                        select: 'name',
                    })
                    .lean();

                if (!anime || Array.isArray(anime)) {
                    console.log(`Anime not found for ID: ${id}`);
                    return null;
                }

                // Get total episode count separately
                const totalEpisodes = await Episode.countDocuments({ animeId: anime._id });

                const result = {
                    ...anime,
                    totalPages: Math.ceil(totalEpisodes / perPage),
                    totalEpisodes
                };

                return result;
            } catch (error) {
                console.error(`Error in getAnimeDetails for ID ${id}:`, error);
                return null;
            }
        }, 3600); // 1 hour
    }
);



// lib/db-utils.ts
export const getEpisodeDetails = cache(
    async (episodeId: string) => {
        const cacheKey = `episode_details_${episodeId}`;
        const cached = await getCachedData<any>(cacheKey);
        if (cached) return cached;

        await connectToDatabase();
        try {
            // First try to find by episodeId
            let episode = await Episode.findOne({ episodeId })
                .populate({
                    path: 'animeId',
                    populate: {
                        path: 'episodes',
                        select: 'episodeId episodeNumber thumbnail name duration displayTitle',
                        options: { sort: { episodeNumber: 1 } }
                    }
                })
                .populate('genres', 'name')
                .lean();

            // If not found and episodeId looks like a MongoDB ObjectId, try searching by _id
        if (!episode && /^[0-9a-fA-F]{24}$/.test(episodeId)) {
            episode = await Episode.findById(episodeId)
                .populate({
                    path: 'animeId',
                    populate: {
                        path: 'episodes',
                        select: 'episodeId episodeNumber thumbnail name duration displayTitle',
                        options: { sort: { episodeNumber: 1 } }
                    }
                })
                .populate('genres', 'name')
                .lean();
        }

        if (!episode) {
            return null;
        }

        await setCachedData(cacheKey, episode, 300); // 5 minutes
        return episode;
    } catch (error) {
        console.error('Error in getEpisodeDetails:', error);
        throw error;
    }
}
);



export const getGenres = cache(
    async () => {
        await connectToDatabase();
        const genres = await Genre.find()
            .select('name')
            .sort({ name: 1 })
            .lean();
        
        return genres;
    }
);


export const searchAnime = cache(
    async (query: string, limit: number = 12) => {
        if (!query || query.trim().length === 0) {
            return [];
        }
        
        await connectToDatabase();
        
        const results = await Anime.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { alternativeTitles: { $regex: query, $options: 'i' } }
            ]
        })
        .select('name poster description genres mediaType alternativeTitles')
        .populate('genres', 'name')
        .limit(limit)
        .lean();
        
        return results;
    }
);

export const getAnimeByGenre = cache(
    async (genreId: string, limit: number = 12) => {
        await connectToDatabase();
        return Anime.find({ genres: genreId })
            .select('name poster description mediaType') // Only select needed fields
            .limit(limit)
            .populate({
                path: 'genres',
                select: 'name',
                options: { limit: 10 } // Limit populated genres
            })
            .lean();
    }
);

// For updating views/likes/dislikes
export const updateEpisodeStats = async (
    episodeId: string,
    update: { views?: number; likes?: number; dislikes?: number }
) => {
    await connectToDatabase();
    return Episode.findOneAndUpdate(
        { episodeId },
        { $inc: update },
        { new: true }
    );
};



// lib/db-utils.ts
export const getFilteredMedia = async ({
    page = 1,
    perPage = 18,
    search = '',
    genres = [],
    sort = 'latest',
    mediaType
}: {
    page?: number;
    perPage?: number;
    search?: string;
    genres?: string[];
    sort?: string;
    mediaType?: 'anime' | 'movie';
}) => {
    await connectToDatabase();

    const skip = (page - 1) * perPage;
    const query: any = {};

    if (mediaType) {
        query.mediaType = mediaType;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { alternativeTitles: { $regex: search, $options: 'i' } }
        ];
    }

    if (genres.length > 0) {
        query.genres = { $all: genres.map(id => new Types.ObjectId(id)) };
    }

    const aggregationPipeline: any[] = [{ $match: query }];

    // Define sorting stage
    let sortStage: any = {};
    switch (sort) {
        case 'views':
            aggregationPipeline.push(
                {
                    $lookup: {
                        from: 'episodes',
                        localField: '_id',
                        foreignField: 'animeId',
                        as: 'episodesData'
                    }
                },
                {
                    $addFields: {
                        totalViews: { $sum: "$episodesData.views" }
                    }
                }
            );
            sortStage = { $sort: { totalViews: -1 } };
            break;
        case 'likes':
            sortStage = { $sort: { likes: -1 } };
            break;
        case 'alphabetical':
            sortStage = { $sort: { name: 1 } };
            break;
        case 'latest':
        default:
            sortStage = { $sort: { createdAt: -1 } };
    }

    aggregationPipeline.push(sortStage);

    // Facet for pagination and total count
    aggregationPipeline.push({
        $facet: {
            media: [
                { $skip: skip },
                { $limit: perPage },
                {
                    $lookup: {
                        from: 'genres',
                        localField: 'genres',
                        foreignField: '_id',
                        as: 'genres'
                    }
                },
                {
                    $project: {
                        episodesData: 0, // Remove the temporary episodes data
                    }
                }
            ],
            totalCount: [
                { $count: 'count' }
            ]
        }
    });

    const results = await Anime.aggregate(aggregationPipeline);

    const media = results[0]?.media || [];
    const totalCount = results[0]?.totalCount[0]?.count || 0;

    return {
        media,
        totalPages: Math.ceil(totalCount / perPage),
        totalCount
    };
};






export const getStaffMembers = cache(
    async (roles?: string[]) => {
        try {
            await connectToDatabase();
            
            let query = {};
            if (roles && roles.length > 0) {
                query = { roles: { $in: roles } };
            } else {
                // Include users who have any role other than just 'user'
                query = { 
                    $and: [
                        { roles: { $exists: true } },
                        { roles: { $ne: [] } },
                        { roles: { $ne: ['user'] } }
                    ]
                };
            }

            const staffMembers = await User.find(query)
                .sort({ 
                    username: 1 
                })
                .lean();

            return JSON.parse(JSON.stringify(staffMembers));
        } catch (error) {
            console.error('Error fetching staff members:', error);
            return [];
        }
    }
);


export const getRecommendedAnimes = async (currentAnimeId: string, limit: number = 6) => {
    const cacheKey = `recommended_animes_${currentAnimeId}_${limit}`;
    const cached = await getCachedData<any[]>(cacheKey);
    if (cached) return cached;

    await connectToDatabase();
    
    // Validate ObjectId before making database query
    if (!validateObjectId(currentAnimeId, 'getRecommendedAnimes')) {
        console.error(`Invalid anime ID provided to getRecommendedAnimes: ${currentAnimeId}`);
        return [];
    }
    
    try {
        // Get current anime's details
        const currentAnimeData = await Anime.findById(currentAnimeId)
            .select('name genres views createdAt description')
            .lean();

        if (!currentAnimeData) {
            console.log(`Anime not found for recommendations: ${currentAnimeId}`);
            return [];
        }

        // Ensure currentAnime is always a single object
        const currentAnime = Array.isArray(currentAnimeData) ? currentAnimeData[0] : currentAnimeData;

        // Extract season number from current anime (if any)
        const seasonRegex = /season\s*(\d+)|s(\d+)|\b(\d+)rd\s+season\b|\b(\d+)th\s+season\b|\b(\d+)nd\s+season\b|\b(\d+)st\s+season\b/i;
        const currentSeasonMatch = (currentAnime?.name || '').match(seasonRegex) || currentAnime?.description?.match(seasonRegex);
        const currentSeason = currentSeasonMatch ? 
            parseInt(currentSeasonMatch.find((n: string) => n !== undefined && !isNaN(parseInt(n)))) : null;

        // Calculate a random offset for variety (changes every hour)
        const hourlyTimestamp = Math.floor(Date.now() / (1000 * 60 * 60));
        const randomSeed = parseInt(currentAnimeId.substring(0, 8) + hourlyTimestamp.toString(), 16);
        const randomSkip = randomSeed % 20; // Random skip between 0-19

        // Create base name without season number for matching
        const baseNameRegex = /^(.+?)(?:\s+season\s*\d+|\s+s\d+|\s+\d+(?:st|nd|rd|th)\s+season|\s+part\s*\d+|\s+cour\s*\d+)/i;
        const baseName = currentAnime?.name?.match(baseNameRegex)?.[1] || currentAnime?.name;

        // First, try to find the next season
        const nextSeason = currentSeason ? await Anime.findOne({
            name: {
                $regex: new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s+(?:season\s*${currentSeason + 1}|s${currentSeason + 1}|${currentSeason + 1}(?:st|nd|rd|th)\s+season)`, 'i')
            }
        }).lean() : null;

        // Then find other recommendations
        const recommendations = await Anime.aggregate([
            {
                $match: {
                    _id: { 
                        $ne: new mongoose.Types.ObjectId(currentAnimeId),
                        ...(nextSeason && !Array.isArray(nextSeason) ? { $ne: nextSeason._id } : {})
                    },
                    $or: [
                        // Match by name pattern (same series)
                        { 
                            name: { 
                                $regex: new RegExp(baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
                            }
                        },
                        // Match by genres
                        { genres: { $in: currentAnime.genres } },
                        // Include some random anime
                        { mediaType: 'anime' }
                    ]
                }
            },
            // Lookup genres
            {
                $lookup: {
                    from: 'genres',
                    let: { genreIds: '$genres' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$genreIds'] } } },
                        { $project: { name: 1 } }
                    ],
                    as: 'genres'
                }
            },
            // Add episodes and views
            {
                $lookup: {
                    from: 'episodes',
                    localField: '_id',
                    foreignField: 'animeId',
                    as: 'episodes'
                }
            },
            {
                $addFields: {
                    episodeCount: { $size: '$episodes' },
                    totalViews: { $sum: '$episodes.views' },
                    // Check if it's from the same series
                    isSameSeries: {
                        $regexMatch: {
                            input: '$name',
                            regex: new RegExp(baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
                        }
                    },
                    matchingGenresCount: {
                        $size: {
                            $setIntersection: ['$genres._id', currentAnime.genres]
                        }
                    },
                    // Add randomization factor
                    randomFactor: {
                        $mod: [
                            { $add: [{ $multiply: ['$totalViews', randomSeed] }, hourlyTimestamp] },
                            100
                        ]
                    }
                }
            },
            // Calculate recommendation score
            {
                $addFields: {
                    score: {
                        $add: [
                            // Same series bonus (40)
                            { $cond: ['$isSameSeries', 40, 0] },
                            // Genre match weight (0-30)
                            { $multiply: ['$matchingGenresCount', 6] },
                            // Popularity weight (0-20)
                            {
                                $min: [
                                    20,
                                    { $multiply: [{ $log10: { $add: ['$totalViews', 1] } }, 4] }
                                ]
                            },
                            // Random factor (0-10)
                            { $divide: ['$randomFactor', 10] }
                        ]
                    }
                }
            },
            // Skip some results for variety
            { $skip: randomSkip },
            // Sort by final score
            { $sort: { score: -1 } },
            { $limit: limit - (nextSeason ? 1 : 0) },
            // Project needed fields
            {
                $project: {
                    _id: 1,
                    name: 1,
                    poster: 1,
                    genres: 1,
                    episodeCount: 1,
                    totalViews: 1,
                    isSameSeries: 1
                }
            }
        ]);

        // Combine next season (if found) with other recommendations
        const result = nextSeason 
            ? [nextSeason, ...recommendations]
            : recommendations;

        await setCachedData(cacheKey, result, 3600); // 1 hour
        return result;

    } catch (error) {
        console.error('Error getting recommended anime:', error);
        return [];
    }
};

// Get user's watchlist
export const getWatchlistByUserId = async (userId: string) => {
    await connectToDatabase();
    return Watchlist.findOne({ userId: new Types.ObjectId(userId) })
        .populate({
            path: 'animes.animeId',
            select: 'name poster genres episodes mediaType studio description alternativeTitles createdAt updatedAt',
            populate: [
                { path: 'genres', select: 'name _id' },
                { path: 'episodes', select: 'episodeNumber episodeId name _id' },
            ]
        })
        .populate('animes.watchedEpisodes', 'episodeNumber name _id')
        .populate('animes.lastWatchedEpisode', 'episodeNumber name _id')
        .lean();
};

// Add anime to watchlist
export const addToWatchlist = async (userId: string, animeId: string) => {
    await connectToDatabase();
    const watchlist = await Watchlist.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
            $setOnInsert: {
                userId: new Types.ObjectId(userId),
                animes: [{
                    animeId: new Types.ObjectId(animeId),
                    watchedEpisodes: [],
                    status: 'plan-to-watch'
                }]
            }
        },
        { upsert: true, new: true }
    );

    if (watchlist.animes.every((anime: { animeId: Types.ObjectId }) => anime.animeId.toString() !== animeId)) {
        watchlist.animes.push({
            animeId: new Types.ObjectId(animeId),
            watchedEpisodes: [],
            status: 'plan-to-watch'
        });
        await watchlist.save();
    }

    return watchlist;
};

// Update anime status in watchlist
export const updateWatchlistAnimeStatus = async (
    userId: string,
    animeId: string,
    status: 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch'
) => {
    await connectToDatabase();
    return Watchlist.findOneAndUpdate(
        { 
            userId: new Types.ObjectId(userId),
            'animes.animeId': new Types.ObjectId(animeId)
        },
        { 
            $set: { 
                'animes.$.status': status,
                updatedAt: new Date()
            }
        },
        { new: true }
    );
};

// Remove anime from watchlist
export const removeAnimeFromWatchlist = async (userId: string, animeId: string) => {
    await connectToDatabase();
    return Watchlist.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { 
            $pull: { animes: { animeId: new Types.ObjectId(animeId) } },
            $set: { updatedAt: new Date() }
        },
        { new: true }
    );
};

// Update watched episodes
export const updateWatchedEpisodes = async (
    userId: string,
    animeId: string,
    episodeId: string,
    isWatched: boolean
) => {
    await connectToDatabase();
    const update = isWatched
        ? {
            $addToSet: { 'animes.$.watchedEpisodes': new Types.ObjectId(episodeId) },
            $set: {
                'animes.$.lastWatchedEpisode': new Types.ObjectId(episodeId),
                updatedAt: new Date()
            }
        }
        : {
            $pull: { 'animes.$.watchedEpisodes': new Types.ObjectId(episodeId) },
            $set: { updatedAt: new Date() }
        };

    return Watchlist.findOneAndUpdate(
        { 
            userId: new Types.ObjectId(userId),
            'animes.animeId': new Types.ObjectId(animeId)
        },
        update,
        { new: true }
    );
};

export const getEpisodeIdByCustomId = async (episodeId: string): Promise<Types.ObjectId | undefined> => {
    await connectToDatabase();
    const episode: IEpisode | null = await Episode.findOne({ episodeId }).select('_id');
    return episode?._id as Types.ObjectId | undefined;
};

// Get watchlist statistics for a user
export const getWatchlistStats = async (userId: string) => {
    await connectToDatabase();
    const watchlist = await Watchlist.findOne({ userId: new Types.ObjectId(userId) })
        .populate({
            path: 'animes.animeId',
            select: 'name episodes',
            populate: { path: 'episodes', select: 'episodeNumber' }
        })
        .populate('animes.watchedEpisodes', 'episodeNumber')
        .lean() as any;

    if (!watchlist) {
        return {
            totalAnime: 0,
            totalEpisodes: 0,
            watchedEpisodes: 0,
            completedAnime: 0,
            watchingAnime: 0,
            planToWatchAnime: 0,
            onHoldAnime: 0,
            droppedAnime: 0,
            averageProgress: 0
        };
    }

    const stats = {
        totalAnime: watchlist.animes.length,
        totalEpisodes: 0,
        watchedEpisodes: 0,
        completedAnime: 0,
        watchingAnime: 0,
        planToWatchAnime: 0,
        onHoldAnime: 0,
        droppedAnime: 0,
        averageProgress: 0
    };

    let totalProgress = 0;

    watchlist.animes.forEach((anime: any) => {
        const totalEpisodes = anime.animeId?.episodes?.length || 0;
        const watchedCount = anime.watchedEpisodes?.length || 0;
        
        stats.totalEpisodes += totalEpisodes;
        stats.watchedEpisodes += watchedCount;
        
        if (totalEpisodes > 0) {
            totalProgress += (watchedCount / totalEpisodes) * 100;
        }

        // Count by status
        switch (anime.status) {
            case 'completed':
                stats.completedAnime++;
                break;
            case 'watching':
                stats.watchingAnime++;
                break;
            case 'plan-to-watch':
                stats.planToWatchAnime++;
                break;
            case 'on-hold':
                stats.onHoldAnime++;
                break;
            case 'dropped':
                stats.droppedAnime++;
                break;
        }
    });

    stats.averageProgress = stats.totalAnime > 0 ? totalProgress / stats.totalAnime : 0;

    return stats;
};

// Clean up orphaned watchlist entries (entries with null animeId references)
export const cleanupOrphanedWatchlistEntries = async (userId: string) => {
    await connectToDatabase();
    
    // Find all anime IDs that exist
    const existingAnimeIds = await Anime.find({}).select('_id').lean() as { _id: Types.ObjectId }[];
    
    // Update watchlist to remove entries with non-existent anime IDs
    const result = await Watchlist.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
            $pull: {
                animes: {
                    animeId: { $nin: existingAnimeIds.map(anime => anime._id) }
                }
            }
        },
        { new: true }
    );
    
    return result;
};

// Add these new functions without user context
export const getHomePageData = cache(
    async () => {
        await connectToDatabase();
        
        const [popularAnime, recentEpisodes, recentAnimes, recentMovies] = await Promise.all([
            getPopularAnime(10),
            getRecentEpisodes(6),
            getRecentAnimes(6),
            getRecentMovies(6)
        ]);
        
        return {
            popularAnime,
            recentEpisodes,
            recentAnimes,
            recentMovies
        };
    }
);
