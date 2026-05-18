import { Suspense } from 'react';
import Script from 'next/script';
import { getHomePageData } from '@/lib/db-utils';
import AnimeSlider from '@/components/ui/anime-slider';
import MediaGrid from '@/components/ui/media-grid';
import MediaGridAnime from '@/components/ui/media-grid-anime';
import { getHomeStructuredData } from '@/config/homestructured-data';
import { GridSkeleton, SliderSkeleton } from '@/components/ui/Skeleton';
import { homeMetadata } from '@/config/homemetadata';
import ErrorBoundary from '@/components/ui/error-boundary';

// ============================================================================
// PAGE CONFIGURATION
// ============================================================================

export const revalidate = 60; // ISR revalidation every 60 seconds
export const dynamic = 'force-static'; // Force static generation
export const metadata = homeMetadata;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Genre {
    name: string;
}

interface Anime {
    _id: any;
    name?: string;
    title?: string;
    poster?: string;
    description?: string;
    genres?: Genre[];
    status?: string;
    censorship?: 'censored' | 'uncensored';
}

interface Episode {
    episodeId?: string;
    _id: any;
    episodeNumber?: number;
    thumbnail?: string;
    views?: number;
    animeId?: {
        name?: string;
        poster?: string;
        status?: string;
        censorship?: 'censored' | 'uncensored';
    };
    isCensored?: boolean;
}

interface HomePageData {
    popularAnime: Anime[];
    recentEpisodes: Episode[];
    recentAnimes: Anime[];
    recentMovies: Anime[];
}

// ============================================================================
// LOADING SKELETON COMPONENTS
// ============================================================================

/**
 * Loading skeleton for content sections with shimmer effect
 */
const SectionSkeleton = () => (
    <div className="space-y-10 mt-8">
        <GridSkeleton columns={6} rows={1} />
        <GridSkeleton columns={6} rows={1} />
    </div>
);

const HeroSkeleton = () => <SliderSkeleton />;

// ============================================================================
// ERROR FALLBACK COMPONENTS
// ============================================================================

/**
 * Error fallback for hero slider section
 */
const HeroError = () => (
    <div className="rounded-xl sm:rounded-2xl bg-background-secondary border border-semantic-error/30 p-4 md:p-8 w-full text-center">
        <h2 className="text-xl text-semantic-error mb-2">Eroare la încărcarea slider-ului</h2>
        <p className="text-text-secondary">Nu am putut încărca hentai-urile populare</p>
    </div>
);

/**
 * Error fallback for content sections
 */
const ContentError = () => (
    <div className="rounded-xl sm:rounded-2xl bg-background-tertiary/80 border border-semantic-error/20 p-4 md:p-6 w-full text-center">
        <h2 className="text-lg text-semantic-error mb-2">Eroare la încărcarea conținutului</h2>
        <p className="text-text-secondary">Nu am putut încărca lista de conținut</p>
    </div>
);

// ============================================================================
// DATA SERIALIZATION FUNCTIONS
// ============================================================================

/**
 * Serializes episode data for slider component
 * Converts MongoDB ObjectIds to strings and provides fallback values
 * @param randomEpisodes - Array of random episodes from database
 * @returns Serialized anime array safe for client-side use
 */
function serializeRandomEpisodes(randomEpisodes: any[]) {
    return randomEpisodes.map(episode => ({
        id: episode.episodeId || episode._id.toString(),
        title: episode.displayTitle || episode.animeDetails?.name || "Nume necunoscut",
        posterPath: episode.thumbnail || episode.animeDetails?.poster || "/placeholder.jpg",
        description: episode.animeDetails?.description || "Nu are descriere",
        genres: episode.genres?.map((genre: Genre) => ({
            name: genre.name
        })) || [],
        link: `/watch/${episode.episodeId || episode._id.toString()}`
    }));
}

/**
 * Serializes episode data for media grid
 * Filters out invalid episodes and formats for display
 * @param episodes - Array of recent episodes
 * @returns Formatted episode array for MediaGrid component
 */
function serializeRecentEpisodes(episodes: Episode[]) {
    return episodes
        .filter((episode: Episode) =>
            episode?.animeId?.name && episode?.animeId?.poster
        )
        .map((episode: Episode) => ({
            id: episode.episodeId || episode._id.toString(),
            title: `${episode.animeId?.name || 'Unknown'} - Episodul ${episode.episodeNumber || '?'}`,
            posterPath: episode.thumbnail || '/placeholder.jpg',
            mediaType: "anime" as const,
            views: episode.views || 0,
            status: (episode.animeId?.status || '').toLowerCase(),
            censorship: (episode.animeId?.censorship || 'censored') as 'censored' | 'uncensored'
        }));
}

/**
 * Serializes anime data for media grid
 * @param animes - Array of anime objects
 * @returns Formatted anime array for MediaGrid component
 */
function serializeAnimeList(animes: Anime[]) {
    return animes.map((anime: Anime) => ({
        id: anime._id?.toString() || '',
        title: anime.name || anime.title || "Nume necunoscut",
        posterPath: anime.poster || '/placeholder.jpg',
        mediaType: "anime" as const,
        status: (anime.status || '').toLowerCase(),
        censorship: (anime.censorship || 'censored') as 'censored' | 'uncensored'
    }));
}

/**
 * Serializes movie data for media grid
 * @param movies - Array of movie objects
 * @returns Formatted movie array for MediaGrid component
 */
function serializeMovieList(movies: Anime[]) {
    return movies.map((movie: Anime) => ({
        id: movie._id?.toString() || '',
        title: movie.name || movie.title || "Nume necunoscut",
        posterPath: movie.poster || '/placeholder.jpg',
        mediaType: "movie" as const
    }));
}

// ============================================================================
// PAGE SECTION COMPONENTS
// ============================================================================

/**
 * Hero section with site title, description, and random episodes slider
 * @param randomEpisodes - Array of random episodes to display in slider
 */
const HeroSection = ({ randomEpisodes }: { randomEpisodes: any[] }) => {
    const serializedRandomEpisodes = serializeRandomEpisodes(randomEpisodes);
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';

    return (
        <div className="w-full">
            <AnimeSlider items={serializedRandomEpisodes} />
        </div>
    );
};

/**
 * Content sections displaying recent episodes, anime, and movies
 * @param recentEpisodes - Array of recently uploaded episodes
 * @param recentAnimes - Array of recently added anime series
 * @param recentMovies - Array of recently added movies/specials
 */
const ContentSection = ({
    recentEpisodes,
    recentAnimes,
}: {
    recentEpisodes: Episode[];
    recentAnimes: Anime[];
}) => {
    // Serialize all data
    const serializedEpisodes = serializeRecentEpisodes(recentEpisodes).slice(0, 3);
    const serializedAnimes = serializeAnimeList(recentAnimes);

    return (
        <div className="space-y-10 sm:space-y-12 mt-8 sm:mt-10">
            <ErrorBoundary fallback={<ContentError />}>
                <MediaGrid
                    title="Ultimele Episoade"
                    items={serializedEpisodes}
                />
            </ErrorBoundary>

            <ErrorBoundary fallback={<ContentError />}>
                <MediaGridAnime
                    title="Ultimele Hentai-uri"
                    items={serializedAnimes}
                    viewAllHref="/hentais"
                />
            </ErrorBoundary>
        </div>
    );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Home page component
 * Displays popular anime slider and recent content sections
 * Uses single database call for optimal performance
 */
export default async function Home() {
    // Single optimized database call for all home page data
    const {
        randomEpisodes,
        recentEpisodes,
        recentAnimes,
    } = await getHomePageData();

    return (
        <div className="py-4 sm:py-6">
            <Script id="homepage-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getHomeStructuredData()) }} strategy="afterInteractive" />

            {/* Hero Slider */}
            <ErrorBoundary fallback={<HeroError />}>
                <Suspense fallback={<HeroSkeleton />}>
                    <HeroSection randomEpisodes={randomEpisodes} />
                </Suspense>
            </ErrorBoundary>

            {/* Content */}
            <ErrorBoundary fallback={<ContentError />}>
                <Suspense fallback={<SectionSkeleton />}>
                    <ContentSection recentEpisodes={recentEpisodes} recentAnimes={recentAnimes} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
