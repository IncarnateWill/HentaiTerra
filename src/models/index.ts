import mongoose from 'mongoose';
import { IAnime } from './types';
import { IEpisode } from './types';
import { IGenre } from './types';
import { IUser } from './types';
import { IWatchlist } from './types';
import { ICard, IUserCard, IShopPrice, ITask, IUserTaskProgress, IWatchHistory, IMarketplaceListing, IRank, ILootbox } from './types';

const AnimeSchema = new mongoose.Schema<IAnime>({
    name: String,
    alternativeTitles: [String],
    description: String,
    studio: String,
    poster: String,
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
    censorship: { type: String, enum: ['censored', 'uncensored'], default: 'censored' },
    createdAt: Date,
    updatedAt: Date, 
    mediaType: String,
    status: { 
        type: String,
        enum: ['ongoing', 'finished', 'upcoming', 'dropped', 'cancelled', 'in-traducere'],
        default: 'upcoming',
        required: true
    },
    malid: { type: Number, required: true, unique: true },
});

const EpisodeSchema = new mongoose.Schema<IEpisode>({
    name: String,
    displayTitle: { type: String, required: true },
    episodeNumber: { type: Number, required: true },
    animeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime', required: true },
    episodeId: { type: String, required: true, unique: true },
    videoUrl: { type: String, required: true },
    videoUrlBackup: { type: String, required: false },
    videoUrlBackup2: { type: String, required: false },
    videoUrlBackup3: { type: String, required: false },
    thumbnail: { type: String, required: true },
    duration: { type: String, required: true, default: '00:00' },
    views: { type: Number, default: 0 },
    releaseDate: { type: Date, required: true },
    updateDate: { type: Date, required: true },
    isCensored: { type: Boolean, default: false },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    traducator: String,
    encoder: String,
    verificator: String,
});

const GenreSchema = new mongoose.Schema<IGenre>({
    name: String,
    description: String,
    createdAt: Date,
});

const UserSchema = new mongoose.Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    username: { type: String },
    email: { type: String },
    imageUrl: { type: String },
    roles: {
        type: [String],
        default: ['user'],
        enum: ['user', 'owner', 'co-owner', 'admin', 'encoder', 'verificator', 'traducator', 'staff'],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    bio: { type: String, default: '' },
    social: {
        discord: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        twitch: { type: String, default: '' },
    },
    points: { type: Number, default: 0 },
    rankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rank' },
});

const WatchlistSchema = new mongoose.Schema<IWatchlist>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    animes: [{
        animeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime', required: true },
        watchedEpisodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
        lastWatchedEpisode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
        status: { 
            type: String, 
            enum: ['watching', 'completed', 'on-hold', 'dropped', 'plan-to-watch'], 
            default: 'plan-to-watch',
            required: true
        }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const CardSchema = new mongoose.Schema<ICard>({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    rarity: { type: String, enum: ['simple', 'bune', 'epic', 'legendar'], required: true },
    description: String,
    pricePoints: Number,
    priceMoney: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserCardSchema = new mongoose.Schema<IUserCard>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    isShowcased: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ShopPriceSchema = new mongoose.Schema<IShopPrice>({
    rarity: { type: String, enum: ['simple', 'bune', 'epic', 'legendar'], required: true },
    pricePoints: Number,
    priceMoney: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema<ITask>({
    title: { type: String, required: true },
    description: String,
    points: { type: Number, required: true },
    taskType: { type: String, enum: ['watch_episodes', 'custom'], required: true },
    requiredEpisodes: Number,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    premium: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const UserTaskProgressSchema = new mongoose.Schema<IUserTaskProgress>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    completed: { type: Boolean, default: false },
    completedDate: Date,
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const WatchHistorySchema = new mongoose.Schema<IWatchHistory>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
    watchTimeSeconds: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const MarketplaceListingSchema = new mongoose.Schema<IMarketplaceListing>({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCard', required: true },
    pricePoints: { type: Number, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const RankSchema = new mongoose.Schema<IRank>({
    name: { type: String, required: true },
    color: { type: String, required: true },
    requiredPoints: Number,
    priceMoney: Number,
    isPremium: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LootboxSchema = new mongoose.Schema<ILootbox>({
    name: { type: String, required: true },
    iconUrl: { type: String, required: true },
    pricePoints: Number,
    priceMoney: Number,
    cardsCount: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    rarities: [{
        rarity: { type: String, enum: ['simple', 'bune', 'epic', 'legendar'], required: true },
        chance: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Anime = mongoose.models.Anime || mongoose.model('Anime', AnimeSchema);
export const Episode = mongoose.models.Episode || mongoose.model('Episode', EpisodeSchema);
export const Genre = mongoose.models.Genre || mongoose.model('Genre', GenreSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);
export const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
export const UserCard = mongoose.models.UserCard || mongoose.model('UserCard', UserCardSchema);
export const ShopPrice = mongoose.models.ShopPrice || mongoose.model('ShopPrice', ShopPriceSchema);
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export const UserTaskProgress = mongoose.models.UserTaskProgress || mongoose.model('UserTaskProgress', UserTaskProgressSchema);
export const WatchHistory = mongoose.models.WatchHistory || mongoose.model('WatchHistory', WatchHistorySchema);
export const MarketplaceListing = mongoose.models.MarketplaceListing || mongoose.model('MarketplaceListing', MarketplaceListingSchema);
export const Rank = mongoose.models.Rank || mongoose.model('Rank', RankSchema);
export const Lootbox = mongoose.models.Lootbox || mongoose.model('Lootbox', LootboxSchema);
