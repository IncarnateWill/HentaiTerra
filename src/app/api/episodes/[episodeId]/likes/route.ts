import { connectToDatabase } from "@/lib/mongodb";
import { Episode } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
    await logToDiscordWebhook(`Failed to connect to database: ${err}`);
});

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ episodeId: string }> }
) {
    try {
        // Await the params to get the resolved value
        const { episodeId } = await context.params;

        await dbConnection;
        const { action } = await request.json();

        let update = {};
        switch (action) {
            case 'like':
                update = { $inc: { likes: 1 } };
                break;
            case 'dislike':
                update = { $inc: { dislikes: 1 } };
                break;
            case 'remove-like':
                update = { $inc: { likes: -1 } };
                break;
            case 'remove-dislike':
                update = { $inc: { dislikes: -1 } };
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        const episode = await Episode.findOneAndUpdate(
            { episodeId: episodeId },
            update,
            { new: true }
        ).select('likes dislikes');

        if (!episode) {
            return NextResponse.json(
                { error: 'Episode not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            likes: episode.likes,
            dislikes: episode.dislikes
        });

    } catch (error) {
        await logToDiscordWebhook(`Error updating likes/dislikes: ${error}`);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
