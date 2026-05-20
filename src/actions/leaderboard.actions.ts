'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { User, UserCard, WatchHistory } from '@/models';
import { getCachedData, setCachedData } from '@/lib/redis';

export async function getLeaderboardData() {
    try {
        const cacheKey = 'leaderboard_data';
        const cachedData = await getCachedData<any>(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        await connectToDatabase();

        // Top 10 by Points
        const topByPoints = await User.find({ points: { $gt: 0 } })
            .sort({ points: -1 })
            .limit(10)
            .select('username imageUrl points')
            .lean();

        // Top 10 by Cards Owned
        const topByCardsAgg = await UserCard.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const topByCards = await User.populate(topByCardsAgg, { 
            path: '_id', 
            select: 'username imageUrl' 
        });

        // Format cards data
        const formattedTopByCards = topByCards.map((item: any) => ({
            user: item._id,
            count: item.count
        })).filter((item: any) => item.user); // Ensure user exists

        // Top 10 by Episodes Watched
        const topByEpisodesAgg = await WatchHistory.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const topByEpisodes = await User.populate(topByEpisodesAgg, { 
            path: '_id', 
            select: 'username imageUrl' 
        });

        // Format episodes data
        const formattedTopByEpisodes = topByEpisodes.map((item: any) => ({
            user: item._id,
            count: item.count
        })).filter((item: any) => item.user);

        const result = {
            points: JSON.parse(JSON.stringify(topByPoints)),
            cards: JSON.parse(JSON.stringify(formattedTopByCards)),
            episodes: JSON.parse(JSON.stringify(formattedTopByEpisodes))
        };

        // Cache for 1 hour (3600 seconds)
        await setCachedData(cacheKey, result, 3600);

        return result;
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return { error: 'Failed to fetch leaderboard data' };
    }
}
