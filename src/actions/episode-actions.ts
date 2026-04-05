// app/actions/episode-actions.ts
'use server'

import { connectToDatabase } from "@/lib/mongodb";
import { Episode } from "@/models";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

export async function updateLikes(
    episodeId: string,
    action: 'like' | 'dislike' | 'remove-like' | 'remove-dislike'
) {
    try {
        await connectToDatabase();

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
        }

        const episode = await Episode.findOneAndUpdate(
            { episodeId },
            update,
            { new: true }
        ).select('likes dislikes');

        return {
            success: true,
            likes: episode.likes,
            dislikes: episode.dislikes
        };
    } catch (error) {
        await logToDiscordWebhook(`Error updating likes/dislikes: ${error}`);
        return {
            success: false,
            error: 'Failed to update'
        };
    }
}

export async function incrementViews(episodeId: string) {
    try {
        await connectToDatabase();
        const episode = await Episode.findOneAndUpdate(
            { episodeId },
            { $inc: { views: 1 } },
            { new: true }
        ).select('views');

        return {
            success: true,
            views: episode.views
        };
    } catch (error) {
        await logToDiscordWebhook(`Error updating views: ${error}`);
        return {
            success: false,
            error: 'Failed to update views'
        };
    }
}