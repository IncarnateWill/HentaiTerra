import { NextResponse } from 'next/server';
import { updateWatchlistAnimeStatus, updateWatchedEpisodes, getEpisodeIdByCustomId } from '@/lib/db-utils';
import { auth } from '@clerk/nextjs/server';
import { User, Watchlist, Episode } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { Types } from 'mongoose';

// Reusable connection with better error handling
const dbConnection = connectToDatabase().catch(console.error);

// Enhanced validation functions
const validateAnimeId = (animeId: string): boolean => {
  return Types.ObjectId.isValid(animeId);
};

const validateStatus = (status: string): boolean => {
  const validStatuses = ['watching', 'plan-to-watch', 'on-hold', 'completed', 'dropped'];
  return validStatuses.includes(status);
};

const validateEpisodeId = (episodeId: string): boolean => {
  return Boolean(episodeId && episodeId.length > 0);
};

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized',
                message: "User not logged in, episode not marked as watched."
            }, { status: 401 });
        }

        const data = await req.json().catch(() => null);
        if (!data) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid request format', 
                    message: 'Request body is required' 
                },
                { status: 400 }
            );
        }

        const { animeId, status, episodeId, isWatched, bulkOperations } = data;

        // Handle bulk operations
        if (bulkOperations && Array.isArray(bulkOperations)) {
            return await handleBulkOperations(userId, bulkOperations);
        }

        // Single operation validation
        if (!animeId) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Missing animeId', 
                    message: 'Anime ID is required' 
                },
                { status: 400 }
            );
        }

        // Validate animeId format
        if (!validateAnimeId(animeId)) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid animeId format', 
                    message: 'Invalid anime ID format' 
                },
                { status: 400 }
            );
        }

        await dbConnection;

        // Get the MongoDB user ID from Clerk ID
        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'User not found', 
                    message: 'User profile not found' 
                },
                { status: 404 }
            );
        }

        // Find or create watchlist with better error handling
        let watchlist = await Watchlist.findOne({ userId: user._id });
        if (!watchlist) {
            try {
                watchlist = await Watchlist.create({ 
                    userId: user._id, 
                    animes: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } catch (error) {
                console.error('Error creating watchlist:', error);
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Failed to create watchlist', 
                        message: 'Unable to create watchlist' 
                    },
                    { status: 500 }
                );
            }
        }

        // Check if anime exists in watchlist, if not, add it
        const animeIndex = watchlist.animes.findIndex(
            (anime: any) => anime.animeId.toString() === animeId
        );

        if (animeIndex === -1) {
            try {
                watchlist.animes.push({
                    animeId: new Types.ObjectId(animeId),
                    status: 'watching', // Default status
                    watchedEpisodes: [],
                    lastWatchedEpisode: null
                });
                await watchlist.save();
            } catch (error) {
                console.error('Error adding anime to watchlist:', error);
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Failed to add anime to watchlist', 
                        message: 'Unable to add anime to watchlist' 
                    },
                    { status: 500 }
                );
            }
        }

        let result;
        if (status) {
            // Validate status
            if (!validateStatus(status)) {
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Invalid status', 
                        message: 'Invalid watchlist status provided' 
                    },
                    { status: 400 }
                );
            }

            try {
                result = await updateWatchlistAnimeStatus(user._id.toString(), animeId, status);
            } catch (error) {
                console.error('Error updating watchlist status:', error);
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Failed to update status', 
                        message: 'Unable to update watchlist status' 
                    },
                    { status: 500 }
                );
            }
        } else if (episodeId !== undefined && isWatched !== undefined) {
            // Validate episodeId
            if (!validateEpisodeId(episodeId)) {
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Invalid episodeId', 
                        message: 'Episode ID is required' 
                    },
                    { status: 400 }
                );
            }

            // Validate isWatched
            if (typeof isWatched !== 'boolean') {
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Invalid isWatched value', 
                        message: 'isWatched must be a boolean' 
                    },
                    { status: 400 }
                );
            }

            try {
                // Look up the ObjectId for the episode
                const episodeObjectId = await getEpisodeIdByCustomId(episodeId);
                if (!episodeObjectId) {
                    return NextResponse.json(
                        { 
                            success: false,
                            error: 'Episode not found', 
                            message: 'Invalid episode ID' 
                        },
                        { status: 400 }
                    );
                }

                if (isWatched) {
                    // Mark all previous episodes as watched
                    const currentEpisode = await Episode.findOne({ 
                        _id: episodeObjectId, 
                        animeId: animeId 
                    }).select('episodeNumber');
                    
                    if (!currentEpisode) {
                        return NextResponse.json(
                            { 
                                success: false,
                                error: 'Episode not found', 
                                message: 'Invalid episode ID' 
                            },
                            { status: 400 }
                        );
                    }

                    const previousEpisodes = await Episode.find({
                        animeId: animeId,
                        episodeNumber: { $lte: currentEpisode.episodeNumber }
                    }).select('_id');
                    
                    const episodeIdsToMark = previousEpisodes.map(ep => ep._id.toString());
                    let lastWatched = episodeObjectId.toString();
                    
                    // Update the watchlist
                    const watchlist = await Watchlist.findOneAndUpdate(
                        { userId: user._id, 'animes.animeId': animeId },
                        {
                            $addToSet: { 'animes.$.watchedEpisodes': { $each: episodeIdsToMark } },
                            $set: { 
                                'animes.$.lastWatchedEpisode': lastWatched, 
                                updatedAt: new Date() 
                            }
                        },
                        { new: true }
                    );
                    result = watchlist;
                } else {
                    // Unmark only this episode
                    result = await updateWatchedEpisodes(user._id.toString(), animeId, episodeObjectId.toString(), isWatched);
                }
            } catch (error) {
                console.error('Error updating watched episodes:', error);
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Failed to update watched episodes', 
                        message: 'Unable to update watched episodes' 
                    },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid update parameters', 
                    message: 'Either status or episodeId with isWatched must be provided' 
                },
                { status: 400 }
            );
        }

        if (!result) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Update failed', 
                    message: 'Failed to update watchlist' 
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Watchlist updated successfully'
        });
    } catch (error) {
        console.error('Error updating watchlist:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Failed to update watchlist'
            },
            { status: 500 }
        );
    }
}

// Handle bulk operations
async function handleBulkOperations(userId: string, operations: Array<{ animeId: string; status: string }>) {
    try {
        await dbConnection;

        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'User not found', 
                    message: 'User profile not found' 
                },
                { status: 404 }
            );
        }

        const results = [];
        const errors = [];

        for (const operation of operations) {
            const { animeId, status } = operation;

            // Validate each operation
            if (!validateAnimeId(animeId)) {
                errors.push({ animeId, error: 'Invalid anime ID format' });
                continue;
            }

            if (!validateStatus(status)) {
                errors.push({ animeId, error: 'Invalid status' });
                continue;
            }

            try {
                const result = await updateWatchlistAnimeStatus(user._id.toString(), animeId, status as any);
                results.push({ animeId, success: true, data: result });
            } catch (error) {
                console.error(`Error updating anime ${animeId}:`, error);
                errors.push({ animeId, error: 'Failed to update status' });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                successful: results,
                failed: errors,
                total: operations.length,
                successfulCount: results.length,
                failedCount: errors.length
            },
            message: `Bulk operation completed. ${results.length} successful, ${errors.length} failed.`
        });
    } catch (error) {
        console.error('Error in bulk operations:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Bulk operation failed',
                message: 'Failed to process bulk operations'
            },
            { status: 500 }
        );
    }
}