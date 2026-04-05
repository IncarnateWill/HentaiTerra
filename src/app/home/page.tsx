import { Suspense } from 'react';
import Script from 'next/script';
import { getHomePageData } from '@/lib/db-utils';
import AnimeSlider from '@/components/ui/anime-slider';
import MediaGrid from '@/components/ui/media-grid';
import MediaGridAnime from '@/components/ui/media-grid-anime';
import { getHomeStructuredData } from '@/config/homestructured-data';
import { GridSkeleton } from '@/components/ui/Skeleton';
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
    <div className="animate-pulse rounded-xl bg-background-tertiary border border-primary-500/20 shadow-lg p-4 md:p-6 w-full min-h-[400px]">
        <div className="h-8 bg-dark-300 rounded-lg mb-4 w-1/3"></div>
        <GridSkeleton columns={6} rows={1} />
    </div>
);

/**
 * Loading skeleton for hero section with proper dimensions
 */
const HeroSkeleton = () => (
    <div className="animate-pulse rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-primary-500/30 shadow-xl p-4 md:p-8 w-full">
        <div className="h-12 bg-dark-300 rounded-lg mb-6 w-3/4 mx-auto"></div>
        <div className="h-6 bg-dark-300 rounded-lg mb-8 w-1/2 mx-auto"></div>
        <div className="h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] bg-dark-300 rounded-xl"></div>
    </div>
);

// ============================================================================
// ERROR FALLBACK COMPONENTS
// ============================================================================

/**
 * Error fallback for hero slider section
 */
const HeroError = () => (
    <div className="rounded-xl sm:rounded-2xl bg-background-secondary border border-semantic-error/30 p-4 md:p-8 w-full text-center">
        <h2 className="text-xl text-semantic-error mb-2">Eroare la încărcarea slider-ului</h2>
        <p className="text-text-secondary">Nu am putut încărca animeurile populare</p>
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
 * Serializes anime data for slider component
 * Converts MongoDB ObjectIds to strings and provides fallback values
 * @param popularAnime - Array of popular anime from database
 * @returns Serialized anime array safe for client-side use
 */
function serializePopularAnime(popularAnime: Anime[]) {
    return popularAnime.map(anime => ({
        id: anime._id.toString(),
        title: anime.name || anime.title || "Nume necunoscut",
        posterPath: anime.poster || "/placeholder.jpg",
        description: anime.description || "Nu are descriere",
        genres: anime.genres?.map((genre: Genre) => ({
            name: genre.name
        })) || []
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
            posterPath: episode.animeId?.poster || '/placeholder.jpg',
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
 * Hero section with site title, description, and popular anime slider
 * @param popularAnime - Array of popular anime to display in slider
 */
const HeroSection = ({ popularAnime }: { popularAnime: Anime[] }) => {
    const serializedPopularAnime = serializePopularAnime(popularAnime);
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';

    return (
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-primary-500/30 shadow-xl p-4 md:p-8 w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-primary-300 via-text-primary to-primary-300 bg-clip-text text-transparent text-center">
                {siteName} - Hentai Online Subtitrat
            </h1>
            <p className="text-base sm:text-lg text-text-secondary text-center mb-6 sm:mb-8 px-2">
                Descoperă cele mai noi hentai-uri subtitrate în română, cu o interfață modernă și ușor de folosit.
            </p>
            <div className="relative">
                <AnimeSlider items={serializedPopularAnime} />
            </div>
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
    const serializedEpisodes = serializeRecentEpisodes(recentEpisodes);
    const serializedAnimes = serializeAnimeList(recentAnimes);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Recent Episodes Section */}
            <ErrorBoundary fallback={<ContentError />}>
                <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-tertiary/80 to-background-secondary/80 border border-primary-500/20 shadow-lg p-4 md:p-6 w-full">
                    <MediaGrid
                        title="Ultimele Episoade"
                        items={serializedEpisodes}
                    />
                </div>
            </ErrorBoundary>
            
            {/* Recent Anime Series Section */}
            <ErrorBoundary fallback={<ContentError />}>
                <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-tertiary/80 to-background-secondary/80 border border-primary-500/20 shadow-lg p-4 md:p-6 w-full">
                    <MediaGridAnime
                        title="Ultimele Hentai-uri"
                        items={serializedAnimes}
                    />
                </div>
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
        popularAnime, 
        recentEpisodes, 
        recentAnimes, 
    } = await getHomePageData();
    
    return (
        <div>
            <div className="container mx-auto py-4 sm:py-8 flex flex-col items-center justify-center">
                {/* Structured Data for SEO */}
                <Script
                    id="homepage-structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(getHomeStructuredData())
                    }}
                    strategy="afterInteractive"
                />
                
                <div className="w-full max-w-8xl flex flex-col gap-4 sm:gap-6 md:gap-8 items-center justify-center">
                    <div className="w-full flex flex-col gap-4 sm:gap-6 items-center justify-center">
                        
                        {/* Hero Section with Popular Anime Slider */}
                        <ErrorBoundary fallback={<HeroError />}>
                            <Suspense fallback={<HeroSkeleton />}>
                                <HeroSection popularAnime={popularAnime} />
                            </Suspense>
                        </ErrorBoundary>
                        
                        {/* Content Sections (Episodes, Anime, Movies) */}
                        <ErrorBoundary fallback={<ContentError />}>
                            <Suspense fallback={<SectionSkeleton />}>
                                <ContentSection 
                                    recentEpisodes={recentEpisodes}
                                    recentAnimes={recentAnimes}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    );
}
