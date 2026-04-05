import mongoose from 'mongoose';
import { IAnime } from './types';
import { IEpisode } from './types';
import { IGenre } from './types';
import { IUser } from './types';
import { IWatchlist } from './types';

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

export const Anime = mongoose.models.Anime || mongoose.model('Anime', AnimeSchema);
export const Episode = mongoose.models.Episode || mongoose.model('Episode', EpisodeSchema);
export const Genre = mongoose.models.Genre || mongoose.model('Genre', GenreSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);
