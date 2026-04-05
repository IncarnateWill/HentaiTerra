// types/index.ts
export interface AnimeData {
    id: string;
    name: string;
    alternativeTitles: string[];
    description: string;
    studio: string;
    poster: string;
    genres: GenreData[];
    episodes: EpisodeData[];
    createdAt: string;
    updatedAt: string;
    mediaType: string;
    status: string;
}


export interface EpisodeData {
    id: string;
    name?: string;
    displayTitle: string;
    episodeNumber: number;
    episodeId: string;
    videoUrl: string;
    videoUrlBackup: string;
    videoUrlBackup2: string;
    videoUrlBackup3: string;
    thumbnail: string;
    duration: string;
    views: number;
    releaseDate: string;
    updateDate: string;
    isCensored: boolean;
    genres: GenreData[];
    likes: number;
    dislikes: number;
    anime?: AnimeData;
}

export interface GenreData {
    id: string;
    name: string;
    description?: string;
    image: string;
    videos: number;
}
