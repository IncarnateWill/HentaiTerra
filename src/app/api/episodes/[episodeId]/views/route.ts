import { connectToDatabase } from "@/lib/mongodb";
import { Episode } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
    await logToDiscordWebhook(`Failed to connect to database: ${err}`);
    console.error('Failed to connect to database:', err);
    throw err;
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ episodeId: string }> }
) {
    const { episodeId } = await params;

    try {
        await dbConnection;

        const episode = await Episode.findOne({ episodeId }).select('views');

        if (!episode) {
            return NextResponse.json(
                { error: 'Episode not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            views: episode.views
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ episodeId: string }> }
) {
    const { episodeId } = await params;

    try {
        await dbConnection;

        const episode = await Episode.findOneAndUpdate(
            { episodeId },
            { $inc: { views: 1 } },
            { new: true }
        ).select('views');

        if (!episode) {
            return NextResponse.json(
                { error: 'Episode not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            views: episode.views
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
