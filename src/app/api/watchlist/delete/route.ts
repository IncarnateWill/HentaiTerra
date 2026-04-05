import { NextResponse } from 'next/server';
import { removeAnimeFromWatchlist } from '@/lib/db-utils';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { Types } from 'mongoose';

// Reusable connection with better error handling
const dbConnection = connectToDatabase().catch(console.error);

// Enhanced validation functions
const validateAnimeId = (animeId: string): boolean => {
  return Types.ObjectId.isValid(animeId);
};

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ 
                success: false,
                error: 'Unauthorized',
                message: 'User not authenticated'
            }, { status: 401 });
        }

        const data = await req.json().catch(() => null);
        if (!data) {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid request format', 
                message: 'Request body is required' 
            }, { status: 400 });
        }

        const { animeId, bulkAnimeIds } = data;

        // Handle bulk deletions
        if (bulkAnimeIds && Array.isArray(bulkAnimeIds)) {
            return await handleBulkDeletions(userId, bulkAnimeIds);
        }

        // Single deletion validation
        if (!animeId) {
            return NextResponse.json({ 
                success: false,
                error: 'Anime ID is required',
                message: 'Please provide an anime ID to remove'
            }, { status: 400 });
        }

        // Validate animeId format
        if (!validateAnimeId(animeId)) {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid anime ID format',
                message: 'The provided anime ID is not valid'
            }, { status: 400 });
        }

        // Get the MongoDB user ID from Clerk ID
        await dbConnection;
        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) {
            return NextResponse.json({ 
                success: false,
                error: 'User not found',
                message: 'User profile not found in database'
            }, { status: 404 });
        }

        try {
            const watchlist = await removeAnimeFromWatchlist(user._id.toString(), animeId);
            return NextResponse.json({
                success: true,
                data: watchlist,
                message: 'Anime removed from watchlist successfully'
            });
        } catch (error) {
            console.error('Error removing anime from watchlist:', error);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Failed to remove anime',
                    message: 'Unable to remove anime from watchlist'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in watchlist delete operation:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Failed to remove anime from watchlist'
            },
            { status: 500 }
        );
    }
}

// Handle bulk deletions
async function handleBulkDeletions(userId: string, animeIds: string[]) {
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

        for (const animeId of animeIds) {
            // Validate each animeId
            if (!validateAnimeId(animeId)) {
                errors.push({ animeId, error: 'Invalid anime ID format' });
                continue;
            }

            try {
                const result = await removeAnimeFromWatchlist(user._id.toString(), animeId);
                results.push({ animeId, success: true, data: result });
            } catch (error) {
                console.error(`Error removing anime ${animeId}:`, error);
                errors.push({ animeId, error: 'Failed to remove anime' });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                successful: results,
                failed: errors,
                total: animeIds.length,
                successfulCount: results.length,
                failedCount: errors.length
            },
            message: `Bulk deletion completed. ${results.length} successful, ${errors.length} failed.`
        });
    } catch (error) {
        console.error('Error in bulk deletions:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Bulk deletion failed',
                message: 'Failed to process bulk deletions'
            },
            { status: 500 }
        );
    }
}