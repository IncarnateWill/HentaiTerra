// models/types.ts
import { Document, Types } from 'mongoose';

export interface IAnime extends Document {
    name: string;
    alternativeTitles: string[];
    description: string;
    studio: string;
    poster: string;
    genres: Types.ObjectId[];
    episodes: Types.ObjectId[];
    censorship?: 'censored' | 'uncensored';
    createdAt: Date;
    updatedAt: Date;
    mediaType: string; // anime or movie o(maybe OVA/ONA/TV)
    status: string;
    malid: number;
}

export interface IEpisode extends Document {
    name?: string;
    displayTitle: string;
    episodeNumber: number;
    animeId: Types.ObjectId;
    episodeId: string;
    videoUrl: string;
    videoUrlBackup?: string;
    videoUrlBackup2?: string;
    videoUrlBackup3?: string;
    thumbnail: string;
    duration: string;
    views: number;
    releaseDate: Date;
    updateDate: Date;
    isCensored: boolean;
    genres: Types.ObjectId[];
    likes: number;
    dislikes: number;
    traducator?: string;
    encoder?: string;
    verificator?: string;
}


export interface IGenre extends Document {
    name: string;
    description?: string;
    createdAt: Date;
}

export interface IUser extends Document {
    clerkId: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    roles?: string[];
    createdAt: Date;
    updatedAt: Date;
    bio: string;
    social: {
        discord: string;
        instagram: string;
        youtube: string;
        twitch: string;
    };
}

export interface IWatchlist extends Document {
    userId: Types.ObjectId;
    animes: Array<{
        animeId: Types.ObjectId;
        watchedEpisodes: Types.ObjectId[];
        lastWatchedEpisode: Types.ObjectId;
        status: 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch';
    }>;
    createdAt: Date;
    updatedAt: Date;
}

// export interface IComment extends Document {
//     userId: Types.ObjectId;
//     animeId: Types.ObjectId;
//     episodeId: Types.ObjectId;
//     content: string;
//     createdAt: Date;
//     updatedAt: Date;
//     parentCommentId?: Types.ObjectId;
// }
