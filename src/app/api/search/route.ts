// app/api/search/route.ts
import { logToDiscordWebhook } from "@/lib/discord-webhook";
import { connectToDatabase } from "@/lib/mongodb";
import { Anime } from "@/models";
import { NextRequest, NextResponse } from "next/server";
// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
    await logToDiscordWebhook(`Failed to connect to database: ${err}`);
});

// Add caching headers
// export const revalidate = 60; // Revalidate every 60 seconds

// Add these export statements at the top of the file
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const limit = Number(searchParams.get('limit')) || 5;
        const page = Number(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        await dbConnection;

        // Create search query with improved matching and index usage
        const searchQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { alternativeTitles: { $regex: query, $options: 'i' } },
                { synopsis: { $regex: query, $options: 'i' } }
            ]
        };

        // Get total count for pagination
        const totalCount = await Anime.countDocuments(searchQuery);

        const animeResults = await Anime.find(searchQuery)
            .select('_id name poster mediaType studio genres synopsis rating releaseDate')
            .populate('genres', 'name')
            .sort({ rating: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            results: animeResults,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalResults: totalCount,
                hasMore: totalCount > skip + limit
            }
        });
        // Removed Cache-Control headers

    } catch (error) {
        await logToDiscordWebhook(`Search error: ${error}`);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}