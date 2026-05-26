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
    role?: string;
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
    points?: number;
    rankId?: Types.ObjectId;
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

export interface ICard extends Document {
    name: string;
    imageUrl: string;
    rarity: 'simple' | 'bune' | 'epic' | 'legendar';
    description?: string;
    pricePoints?: number;
    priceMoney?: number;
    sellPricePoints?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserCard extends Document {
    userId: Types.ObjectId;
    cardId: Types.ObjectId;
    isShowcased?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IShopPrice extends Document {
    rarity: 'simple' | 'bune' | 'epic' | 'legendar';
    pricePoints?: number;
    priceMoney?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITask extends Document {
    title: string;
    description?: string;
    points: number;
    taskType: 'watch_episodes' | 'custom';
    requiredEpisodes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    premium: boolean;
    active: boolean;
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserTaskProgress extends Document {
    userId: Types.ObjectId;
    taskId: Types.ObjectId;
    completed: boolean;
    completedDate?: Date;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWatchHistory extends Document {
    userId: Types.ObjectId;
    episodeId: Types.ObjectId;
    watchTimeSeconds: number;
    pointsEarned: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMarketplaceListing extends Document {
    sellerId: Types.ObjectId;
    userCardId: Types.ObjectId;
    pricePoints: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRank extends Document {
    name: string;
    color: string;
    requiredPoints?: number;
    priceMoney?: number;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILootbox extends Document {
    name: string;
    iconUrl: string;
    pricePoints?: number;
    priceMoney?: number;
    cardsCount: number;
    active: boolean;
    rarities: {
        rarity: 'simple' | 'bune' | 'epic' | 'legendar';
        chance: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IImage extends Document {
    filename: string;
    contentType: string;
    data: Buffer;
    createdAt: Date;
    updatedAt: Date;
}
