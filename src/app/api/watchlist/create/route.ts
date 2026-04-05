import { NextResponse } from 'next/server';
import { addToWatchlist } from '@/lib/db-utils';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';

// Reusable connection
const dbConnection = connectToDatabase().catch(console.error);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { animeId } = await req.json();
        if (!animeId) {
            return NextResponse.json({ error: 'Anime ID is required' }, { status: 400 });
        }

        // Get the MongoDB user ID from Clerk ID
        await dbConnection;
        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const watchlist = await addToWatchlist(user._id.toString(), animeId);
        return NextResponse.json(watchlist);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to add anime to watchlist' },
            { status: 500 }
        );
    }
}