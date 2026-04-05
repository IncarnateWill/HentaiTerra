import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User, Watchlist } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { Types } from 'mongoose';

// Reusable connection
const dbConnection = connectToDatabase().catch(console.error);

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const animeId = url.searchParams.get('animeId');
        const episodeId = url.searchParams.get('episodeId');

        if (!animeId || !episodeId) {
            return NextResponse.json({ error: 'Missing animeId or episodeId' }, { status: 400 });
        }

        await dbConnection;
        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find or create watchlist
        let watchlist = await Watchlist.findOne({ userId: user._id });
        if (!watchlist) {
            watchlist = new Watchlist({ userId: user._id, animes: [] });
        }

        // Find or create anime entry
        let animeEntry = watchlist.animes.find(
            (a: any) => a.animeId.toString() === animeId
        );

        if (!animeEntry) {
            watchlist.animes.push({
                animeId: new Types.ObjectId(animeId),
                watchedEpisodes: [new Types.ObjectId(episodeId)]
            });
        } else if (!animeEntry.watchedEpisodes.some(
            (id: Types.ObjectId) => id.toString() === episodeId
        )) {
            animeEntry.watchedEpisodes.push(new Types.ObjectId(episodeId));
        }

        await watchlist.save();

        return NextResponse.json({ isWatched: true });
    } catch (error) {
        console.error('Error handling watch status:', error);
        return NextResponse.json(
            { error: 'Failed to handle watch status' },
            { status: 500 }
        );
    }
}