import { Metadata } from 'next';
import { getAnimeDetails, getRecommendedAnimes, isValidObjectId } from '@/lib/db-utils';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { User, Watchlist } from '@/models';
import { Suspense } from 'react';
import Image from "next/image";
import Pagination from "@/components/ui/pagination";
import FAQ, { animePageFAQ } from "@/components/shared/FAQ";
import AdditionalNavigation, { mainNavigationLinks } from "@/components/shared/AdditionalNavigation";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

export const revalidate = 60;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PageParams = {
    mediaId: string;
    searchParams?: { page?: string };
};

interface Genre {
    _id: string;
    name: string;
}

interface Episode {
    episodeId: string;
    episodeNumber: number;
    isCensored: boolean;
    [key: string]: any;
}

interface AnimeDetails {
    _id: string;
    name: string;
    description: string;
    poster: string;
    genres: Genre[];
    studio: string;
    alternativeTitles: string[];
    episodes: Episode[];
    status?: string;
    createdAt: string;
    updatedAt: string;
    rating?: number;
    reviewCount?: number;
    actors?: Array<{ name: string }>;
    director?: string;
    totalPages?: number;
}

interface RecommendedAnime {
    _id: string;
    name: string;
    poster: string;
    episodeCount: number;
    totalViews: number;
    genres: Genre[];
}

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const LoadingInfo = () => (
    <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

const LoadingEpisodes = () => (
    <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

const LoadingRecommendations = () => (
    <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

// ============================================================================
// DYNAMIC IMPORTS - Improve initial page load performance
// ============================================================================

const MediaInfo = dynamic(() => import("@/components/video/media-info-anime"), {
    loading: () => <LoadingInfo />,
    ssr: true
});

const AnimeEpisodeList = dynamic(() => import("@/components/video/episode-list-anime"), {
    loading: () => <LoadingEpisodes />,
    ssr: true
});

const WatchlistButton = dynamic(() => import('@/components/ui/WatchlistButton'), {
    loading: () => <LoadingInfo />,
    ssr: true
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates anime data structure
 * @param anime - The anime object to validate
 * @returns True if anime is valid, false otherwise
 */
function validateAnimeData(anime: any): anime is AnimeDetails {
    return !!(anime && !Array.isArray(anime) && anime._id && anime.name);
}

// ============================================================================
// KEYWORD GENERATION HELPERS
// ============================================================================

/**
 * Generates base SEO keywords for an anime (high-quality, long-tail keywords)
 * @param animeName - The name of the anime
 * @param siteName - The site name
 * @returns Array of base keyword strings
 */
function generateBaseKeywords(animeName: string, siteName: string): string[] {
    return [
        animeName,
        `${animeName} online subtitrat română`,
        `${animeName} episoade online`,
        `${animeName} hd subtitrat`,
        'hentai subtitrat română hd',
        'hentai online subtitrat română',
        'hentai episoade noi România',
    ];
}

/**
 * Generates keywords from alternative titles (focused on quality)
 * @param alternativeTitles - Array of alternative titles
 * @returns Array of keyword strings derived from alternative titles
 */
function generateAlternativeTitleKeywords(alternativeTitles: string[]): string[] {
    // Only use top 2 alternative titles to avoid keyword stuffing
    return alternativeTitles.slice(0, 2).flatMap((title: string) => title ? [
        `${title} online subtitrat`,
        `${title} episoade hd`,
    ] : []);
}

/**
 * Generates keywords from genre information (focused, natural combinations)
 * @param genreNames - Array of genre names
 * @returns Array of genre-based keyword strings
 */
function generateGenreKeywords(genreNames: string[]): string[] {
    // Limit to top 3 genres to keep it natural
    return genreNames.slice(0, 3).map((genre: string) => 
        `hentai ${genre} subtitrat română`
    );
}

/**
 * Generates keywords from release year (targeted temporal keywords)
 * @param releaseYear - The release year of the anime
 * @returns Array of year-based keyword strings
 */
function generateYearKeywords(releaseYear?: number): string[] {
    if (!releaseYear) return [];
    
    return [
        `hentai ${releaseYear} subtitrat română`,
    ];
}

/**
 * Generates additional targeted long-tail keywords
 * @param animeName - The name of the anime
 * @returns Array of long-tail keyword strings
 */
function generateGeneralKeywords(animeName: string): string[] {
    return [
        `unde pot viziona ${animeName} online`,
        `${animeName} toate episoadele subtitrat`,
    ];
}

/**
 * Combines and deduplicates all keywords
 * @param keywordArrays - Multiple arrays of keywords to combine
 * @returns Deduplicated array of keywords (max 30 for quality)
 */
function combineAndDeduplicateKeywords(...keywordArrays: string[][]): string[] {
    const allKeywords = keywordArrays.flat();
    // Reduced from 150 to 30 to focus on quality over quantity
    return [...new Set(allKeywords)].slice(0, 30);
}

// ============================================================================
// METADATA GENERATION HELPERS
// ============================================================================

/**
 * Extracts genre names from genre objects or strings
 * @param genres - Array of genre objects or strings
 * @returns Array of genre name strings
 */
function extractGenreNames(genres: any[]): string[] {
    if (!Array.isArray(genres)) return [];
    
    return genres
        .map((g: any) => typeof g === 'string' ? g : g?.name)
        .filter(Boolean);
}

/**
 * Derives release year from createdAt date
 * @param createdAt - ISO date string
 * @returns Release year or undefined
 */
function deriveReleaseYear(createdAt?: string): number | undefined {
    if (!createdAt) return undefined;
    return new Date(createdAt).getFullYear();
}

/**
 * Resolves poster URL to absolute URL
 * @param poster - Poster path (relative or absolute)
 * @param siteUrl - Base site URL
 * @returns Absolute poster URL
 */
function resolvePosterUrl(poster: string, siteUrl: string): string {
    if (!poster) return '';
    return new URL(poster, siteUrl).toString();
}

/**
 * Generates complete SEO metadata for an anime
 * @param anime - The anime details object
 * @param mediaId - The anime's media ID
 * @returns Metadata object for Next.js
 */
function generateSEOMetadata(anime: AnimeDetails, mediaId: string): Metadata {
    const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';
    
    // Generate titles and descriptions
    const romanianTitle = `${anime.name} - Urmărește Online HD Gratis | ${siteName}`;
    const romanianDescription = `Urmărește ${anime.name} online HD subtitrat în română pe ${siteName}. Cel mai bun site pentru hentai-uri subtitrate în română.`.substring(0, 165);
    
    // Process poster
    const posterUrl = resolvePosterUrl(anime.poster, siteUrl);
    
    // Extract data
    const releaseYear = deriveReleaseYear(anime.createdAt);
    const genreNames = extractGenreNames(anime.genres);
    const alternativeTitles = anime.alternativeTitles || [];
    
    // Generate all keyword categories
    const baseKeywords = generateBaseKeywords(anime.name, siteName);
    const altTitleKeywords = generateAlternativeTitleKeywords(alternativeTitles);
    const genreKeywords = generateGenreKeywords(genreNames);
    const yearKeywords = generateYearKeywords(releaseYear);
    const generalKeywords = generateGeneralKeywords(anime.name);
    
    // Combine all keywords
    const keywords = combineAndDeduplicateKeywords(
        baseKeywords,
        altTitleKeywords,
        genreKeywords,
        yearKeywords,
        generalKeywords
    );
    
    return {
        title: romanianTitle,
        description: romanianDescription,
        keywords,
        openGraph: {
            url: `${siteUrl}/hentai/${mediaId}`,
            title: romanianTitle,
            description: romanianDescription,
            images: posterUrl ? [{ 
                url: posterUrl,
                width: 800,
                height: 600,
                alt: `Poster ${anime.name}` 
            }] : [],
            type: 'website',
            locale: 'ro_RO',
            siteName: siteName,
            countryName: 'Romania',
            determiner: 'auto',
            emails: [`contact@${siteName.toLowerCase()}.ro`],
            faxNumbers: [],
            audio: [],
            ttl: 7 * 24,
        },
        twitter: {
            card: 'summary_large_image',
            title: romanianTitle,
            description: romanianDescription,
            images: posterUrl ? [posterUrl] : [],
            site: '@HentaiUnited',
            creator: '@HentaiUnited',
        },
        alternates: {
            canonical: `${siteUrl}/hentai/${mediaId}`,
            languages: {
                'ro-RO': `${siteUrl}/hentai/${mediaId}`,
            }
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
                'max-video-preview': 'auto',
                'max-image-preview': 'large',
            }
        }
    };
}

// ============================================================================
// STRUCTURED DATA GENERATION
// ============================================================================

/**
 * Generates TVSeries structured data for SEO
 * @param anime - The anime details object
 * @param mediaId - The anime's media ID
 * @param siteUrl - Base site URL
 * @returns Schema.org TVSeries structured data
 */
function generateTVSeriesStructuredData(anime: AnimeDetails, mediaId: string, siteUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        name: anime.name,
        description: anime.description,
        url: `${siteUrl}/hentai/${mediaId}`,
        image: anime.poster,
        genre: anime.genres.map((genre: Genre) => genre.name),
        numberOfEpisodes: anime.episodes?.length || 0,
        countryOfOrigin: 'JP',
        inLanguage: 'ja',
        subtitleLanguage: 'Română',
        datePublished: anime.createdAt,
        creator: {
            '@type': 'Organization',
            name: anime.studio
        },
        ...(anime.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: anime.rating,
                reviewCount: anime.reviewCount || 1
            }
        }),
        ...(anime.actors && {
            actor: anime.actors.map((actor: any) => ({
                '@type': 'Person',
                name: actor.name
            }))
        }),
        ...(anime.director && {
            director: {
                '@type': 'Person',
                name: anime.director
            }
        }),
    };
}

/**
 * Generates BreadcrumbList structured data for SEO
 * @param anime - The anime details object
 * @param mediaId - The anime's media ID
 * @param siteUrl - Base site URL
 * @returns Schema.org BreadcrumbList structured data
 */
function generateBreadcrumbStructuredData(anime: AnimeDetails, mediaId: string, siteUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": siteUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Hentai-uri",
                "item": `${siteUrl}/hentais`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": anime.name,
                "item": `${siteUrl}/hentai/${mediaId}`
            }
        ]
    };
}

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

/**
 * Prepares media data object for rendering
 * @param anime - The anime details object
 * @returns Formatted media data object
 */
function prepareMediaData(anime: AnimeDetails) {
    return {
        id: anime._id.toString(),
        title: anime.name,
        alternativeTitles: anime.alternativeTitles || [],
        synopsis: anime.description || 'No description available',
        posterPath: anime.poster || '',
        genres: anime.genres.map((genre: Genre) => ({ 
            name: genre.name, 
            _id: genre._id.toString() 
        })),
        creator: anime.studio || 'Unknown Studio',
        releaseDate: anime.createdAt ? new Date(anime.createdAt).toLocaleDateString() : 'Unknown',
        uploadDate: anime.updatedAt ? new Date(anime.updatedAt).toLocaleDateString() : 'Unknown',
        censorship: (typeof (anime as any).censorship === 'string'
            ? (((anime as any).censorship as string).toLowerCase() === 'uncensored' ? 'Uncensored' : 'Censored')
            : (anime.episodes.some((episode: Episode) => episode.isCensored) ? 'Censored' : 'Uncensored')) as 'Censored' | 'Uncensored',
    };
}

/**
 * Fetches user's watchlist status for an anime
 * @param userId - Clerk user ID
 * @param animeId - The anime's database ID
 * @returns Watchlist status or null
 */
async function getWatchlistStatus(userId: string | null, animeId: string): Promise<string | null> {
    if (!userId) return null;
    
    try {
        const user = await User.findOne({ clerkId: userId }).select('_id');
        if (!user) return null;
        
        const watchlistEntry = await Watchlist.findOne({
            userId: user._id,
            'animes.animeId': animeId
        }).select('animes.$');
        
        return watchlistEntry?.animes[0]?.status || null;
    } catch (error) {
        console.error('Error fetching watchlist status:', error);
        return null;
    }
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

export async function generateMetadata({
    params,
}: {
    params: Promise<{ mediaId: string }>;
}): Promise<Metadata> {
    try {
        const { mediaId } = await params;
        
        // Validate ObjectId before making database queries
        if (!isValidObjectId(mediaId)) {
            await logToDiscordWebhook(`Invalid mediaId attempted: ${mediaId} - generateMetadata`);
            return {
                title: 'Hentai nu a fost găsit | HentaiUnited',
                description: 'ID-ul hentai-ului nu este valid.',
                robots: { index: false, follow: false },
            };
        }
        
        const anime = await getAnimeDetails(mediaId);
        
        // Validate anime data
        if (!validateAnimeData(anime)) {
            await logToDiscordWebhook(`Anime not found for valid ID: ${mediaId} - generateMetadata`);
            return {
                title: 'Hentai nu a fost găsit | HentaiUnited',
                description: 'Hentai-ul căutat nu există în baza noastră de date.',
                robots: { index: false, follow: false },
            };
        }
        
        return generateSEOMetadata(anime, mediaId);
    } catch (error) {
        await logToDiscordWebhook(`Error in generateMetadata: ${error}`);
        return {
            title: 'Eroare la încărcarea conținutului | HentaiUnited',
            description: 'A apărut o eroare la încărcarea hentai-ului.',
            robots: { index: false, follow: false },
        };
    }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function AnimeDetailsPage({
    params,
    searchParams,
}: {
    params: Promise<{ mediaId: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { mediaId } = await params;
    const { page } = await searchParams;
    const resolvedPage = Number(page) || 1;

    // Validate ObjectId before making database queries
    if (!isValidObjectId(mediaId)) {
        await logToDiscordWebhook(`Invalid mediaId attempted: ${mediaId} - AnimeDetailsPage`);
        notFound();
    }

    // Fetch anime details and recommendations in parallel
    const [anime, recommendedAnime] = await Promise.all([
        getAnimeDetails(mediaId, resolvedPage),
        getRecommendedAnimes(mediaId)
    ]);

    // Validate anime data
    if (!validateAnimeData(anime)) {
        await logToDiscordWebhook(`Anime not found for valid ID: ${mediaId} - AnimeDetailsPage`);
        notFound();
    }

    // Prepare data
    const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
    const mediaData = prepareMediaData(anime);
    
    // Generate structured data
    const structuredData = generateTVSeriesStructuredData(anime, mediaId, siteUrl);
    const breadcrumbList = generateBreadcrumbStructuredData(anime, mediaId, siteUrl);

    // Get watchlist status
    const { userId } = await auth();
    const watchlistStatus = await getWatchlistStatus(userId, anime._id);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="container mx-auto py-6">
            {/* SEO Meta Tags */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta httpEquiv="content-language" content="ro" />
            <link rel="canonical" href={`${siteUrl}/hentai/${mediaId}`} />
            <link rel="alternate" hrefLang="ro" href={`${siteUrl}/hentai/${mediaId}`} />
            
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
            />
            
            <div className="flex flex-col lg:flex-row lg:space-x-8">
                <div className="lg:flex-grow lg:w-[65%]">
                    {/* Media Info Section */}
                    <Suspense fallback={<LoadingInfo />}>
                        <MediaInfo media={{
                            title: mediaData.title,
                            alternativeTitles: mediaData.alternativeTitles,
                            synopsis: mediaData.synopsis,
                            posterPath: mediaData.posterPath,
                            genres: mediaData.genres,
                            creator: mediaData.creator,
                            releaseDate: mediaData.releaseDate,
                            uploadDate: mediaData.uploadDate,
                            censorship: mediaData.censorship,
                            status: (anime.status || '').toLowerCase(),
                        }} />
                    </Suspense>
                    
                    {/* Watchlist Button */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <Suspense fallback={<LoadingInfo />}>
                            <WatchlistButton 
                                animeId={anime._id.toString()} 
                                initialStatus={watchlistStatus as "watching" | "completed" | "on-hold" | "dropped" | "plan-to-watch" | null | undefined}
                            />
                        </Suspense>
                    </div>
                    
                    {/* Episodes Section */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4 text-text-primary">Episoade</h2>
                        {anime.episodes && anime.episodes.length > 0 ? (
                            <>
                                <AnimeEpisodeList 
                                    episodes={anime.episodes as any} 
                                    currentEpisodeId="" 
                                />
                                
                                {/* Pagination */}
                                {anime.totalPages && anime.totalPages > 1 && (
                                    <Pagination
                                        currentPage={resolvedPage}
                                        totalPages={anime.totalPages}
                                        baseUrl={`/hentai/${mediaId}`}
                                        searchParams={{}}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="bg-dark-500/30 p-6 rounded-lg border border-dark-400">
                                <p className="text-text-secondary text-lg italic">
                                    Nici un episod nu a fost postat inca
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommended Series Section */}
            {recommendedAnime && recommendedAnime.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">Serii Recomandate</h2>
                    <Suspense fallback={<LoadingRecommendations />}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {recommendedAnime.map((recommended: RecommendedAnime) => (
                                <a 
                                    key={recommended._id} 
                                    href={`/hentai/${recommended._id}`}
                                    className="block group hover:opacity-90 transition-all duration-300"
                                >
                                    <div className="relative pb-[140%] overflow-hidden rounded-lg bg-dark-300 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                                        <Image 
                                            src={recommended.poster || "/default-thumbnail.jpg"} 
                                            alt={recommended.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            loading="lazy"
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-3 text-text-primary">
                                                <p className="text-sm font-medium truncate">
                                                    {recommended.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                                    <span>{recommended.episodeCount} episoade</span>
                                                    <span>•</span>
                                                    <span>
                                                        {(recommended.totalViews || 0).toLocaleString()} vizualizări
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {recommended.genres.slice(0, 2).map((genre: Genre) => (
                                                        <span 
                                                            key={genre._id}
                                                            className="text-xs px-1.5 py-0.5 bg-text-primary/20 rounded-full"
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </Suspense>
                </div>
            )}

            {/* FAQ Section */}
            <div className="mt-8">
                <FAQ 
                    title="Întrebări Frecvente - Hentai"
                    items={animePageFAQ}
                />
            </div>
            
            {/* Navigation Links */}
            <div className="mt-8">
                <AdditionalNavigation 
                    title="Navigare Rapidă"
                    links={mainNavigationLinks}
                />
            </div>
        </div>
    );
}
