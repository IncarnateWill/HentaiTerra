import { Metadata } from "next";
import { getEpisodeDetails, getRecommendedAnimes } from "@/lib/db-utils";
import { getCachedData, setCachedData } from "@/lib/redis";
import dynamic from 'next/dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import EpisodePaginationWrapper from "@/components/video/EpisodePaginationWrapper";
import { watchPageFAQ } from "@/components/shared/FAQ";
import { logToDiscordWebhook } from "@/lib/discord-webhook";
import VideoPlayerWithSources from "@/components/video/VideoPlayerClient";

export const revalidate = 60;

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const LoadingVideo = () => (
  <div className="animate-pulse bg-dark-500/50 aspect-video rounded-lg" />
);

const LoadingInfo = () => (
  <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

const LoadingButtons = () => (
  <div className="animate-pulse bg-dark-500/50 h-12 rounded-lg" />
);

const LoadingEpisodes = () => (
  <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

const LoadingComments = () => (
  <div className="animate-pulse bg-dark-500/50 h-64 rounded-lg" />
);

// ============================================================================
// DYNAMIC IMPORTS - Improve initial page load performance
// ============================================================================


const MediaInfo = dynamic(() => import("@/components/video/media-info"), {
  loading: () => <LoadingInfo />,
  ssr: true
});

const ActionButtons = dynamic(() => import("@/components/video/action-buttons"), {
  loading: () => <LoadingButtons />,
  ssr: true
});

const DisqusDiscussionEmbed = dynamic(() => import("@/components/disquss/episode"), {
  loading: () => <LoadingComments />,
  ssr: true
});



// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Genre {
  name: string;
  _id?: string;
}

interface Anime {
  name: string;
  alternativeTitles: string[];
  description: string;
  poster: string;
  studio: string;
  _id: string;
  episodes: Episode[];
  status?: string;
  mediaType?: string;
  malid?: number;
  createdAt?: string | Date;
}

interface Episode {
  episodeId: string;
  episodeNumber: number;
  animeId: Anime;
  genres: Genre[];
  releaseDate: string;
  updateDate: string;
  isCensored: boolean;
  videoUrl: string;
  videoUrlBackup?: string;
  videoUrlBackup2?: string;
  videoUrlBackup3?: string;
  duration?: string | number;
  likes: number;
  dislikes: number;
  views: number;
  thumbnail: string;
  name: string;
  traducator?: string;
  encoder?: string;
  verificator?: string;
  __v?: number;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates that an episode object has all required fields
 * @param episode - The episode object to validate
 * @returns True if episode is valid, false otherwise
 */
function validateEpisode(episode: any): episode is Episode {
  return (
    episode &&
    typeof episode === 'object' &&
    !Array.isArray(episode) &&
    episode.episodeId &&
    episode.animeId &&
    episode.animeId.name &&
    typeof episode.episodeNumber === 'number' &&
    episode.videoUrl
  );
}

/**
 * Validates that a mediaId is a non-empty string
 * @param mediaId - The media ID to validate
 * @returns True if valid, false otherwise
 */
function validateMediaId(mediaId: any): boolean {
  return !!(mediaId && typeof mediaId === 'string' && mediaId.trim());
}

// ============================================================================
// SERIALIZATION FUNCTIONS
// ============================================================================

/**
 * Serializes an episode object, converting MongoDB ObjectIds to strings
 * @param episode - The episode to serialize
 * @returns Serialized episode object safe for client-side use
 */
function serializeEpisode(episode: any) {
  return {
    ...episode,
    _id: episode._id?.toString?.() || episode._id,
  };
}

// ============================================================================
// METADATA GENERATION HELPERS
// ============================================================================

/**
 * Generates SEO keywords for an episode
 * @param episode - The episode to generate keywords for
 * @returns Array of keyword strings
 */
function generateKeywords(episode: Episode): string[] {
  const episodeTitle = `${episode.animeId.name} - Episodul ${episode.episodeNumber} - ${episode.name}`;
  const altTitles = episode.animeId.alternativeTitles || [];

  return [
    episodeTitle,
    ...altTitles.slice(1, 4),
    `${episode.animeId.name} episodul ${episode.episodeNumber}`,
    // Generate variations with different suffixes
    ...['online', 'rosub', 'subtitrat'].flatMap(suffix =>
      altTitles.slice(0, 3).map(title =>
        `${title || ''} episodul ${episode.episodeNumber || 1} ${suffix}`
      )
    ),
    `${episode.animeId.name} episodul ${episode.episodeNumber || 1} subtitrat`,
    `${episode.animeId.name} episodul ${episode.episodeNumber || 1} rosub`,
    // Competitor site keywords
    ...['animekage', 'anime-nexus', 'anime4life', 'managkids', 'animedemons'].flatMap(site => [
      `${episode.animeId.name} ${site}`,
      `${episode.animeId.name} ${site} rosub`
    ]),
    // Generic hentai keywords
    "hentai rosub",
    "hentai online românia",
    "hentai hd gratis",
    "hentai episoade noi",
    "hentai subtitrat ro"
  ];
}

/**
 * Resolves a thumbnail URL to an absolute URL
 * @param thumbnail - The thumbnail URL (relative or absolute)
 * @param posterPath - Fallback poster path
 * @param siteUrl - The base site URL
 * @returns Absolute thumbnail URL
 */
function resolveThumbnailUrl(thumbnail: string, posterPath: string, siteUrl: string): string {
  if (thumbnail) {
    return thumbnail.startsWith('http') ? thumbnail : `${siteUrl}${thumbnail}`;
  }
  return posterPath || `${siteUrl}/default-thumbnail.jpg`;
}

/**
 * Formats duration to ISO 8601 duration format (PT#M#S)
 * Handles both string formats (e.g., '24m') and numeric seconds
 * @param duration - Duration as string ('24m', '1h 30m') or number (seconds)
 * @returns ISO 8601 duration string or undefined
 */
function formatDuration(duration?: string | number): string | undefined {
  if (!duration) return undefined;

  // If duration is a number, treat it as seconds
  if (typeof duration === 'number') {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `PT${minutes}M${seconds}S`;
  }

  // If duration is a string, parse it
  if (typeof duration === 'string') {
    // Match patterns like '24m', '1h 30m', '90m', etc.
    const hourMatch = duration.match(/(\d+)h/);
    const minuteMatch = duration.match(/(\d+)m/);
    const secondMatch = duration.match(/(\d+)s/);

    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;

    // Convert everything to total minutes and seconds
    const totalMinutes = (hours * 60) + minutes;
    const totalSeconds = seconds;

    if (totalMinutes === 0 && totalSeconds === 0) return undefined;

    // Build ISO 8601 duration string
    let result = 'PT';
    if (totalMinutes > 0) result += `${totalMinutes}M`;
    if (totalSeconds > 0) result += `${totalSeconds}S`;

    return result;
  }

  return undefined;
}

// ============================================================================
// STRUCTURED DATA GENERATION
// ============================================================================

/**
 * Generates VideoObject structured data for SEO
 */
function generateVideoStructuredData(episode: Episode, episodeTitle: string, thumbnailUrl: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: episodeTitle,
    description: (episode.animeId.description || 'No description available').substring(0, 155),
    thumbnailUrl: [thumbnailUrl],
    uploadDate: episode.releaseDate || new Date().toISOString(),
    contentUrl: `${siteUrl}/watch/${episode.episodeId}`,
    embedUrl: `${siteUrl}/watch/${episode.episodeId}`,
    duration: formatDuration(episode.duration),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: episode.views || 0,
    },
    genre: (episode.genres || []).map(g => g.name),
    publisher: {
      "@type": "Organization",
      name: episode.animeId.studio || "HentaiTerra",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "WatchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/watch/${episode.episodeId}`,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      }
    },
    inLanguage: "ro",
    width: "1920",
    height: "1080",
  };
}

/**
 * Generates BreadcrumbList structured data for SEO
 */
function generateBreadcrumbStructuredData(episode: Episode, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Acasă",
        item: siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: episode.animeId.name,
        item: `${siteUrl}/hentai/${episode.animeId._id}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Episodul ${episode.episodeNumber}`,
        item: `${siteUrl}/watch/${episode.episodeId}`
      }
    ]
  };
}

/**
 * Generates Episode structured data for SEO
 */
function generateEpisodeStructuredData(episode: Episode, episodeTitle: string, thumbnailUrl: string, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Episode",
    name: episodeTitle,
    episodeNumber: episode.episodeNumber,
    partOfSeries: {
      "@type": "TVSeries",
      name: episode.animeId.name,
      url: `${siteUrl}/hentai/${episode.animeId._id}`,
      genre: (episode.genres || []).map(g => g.name),
    },
    url: `${siteUrl}/watch/${episode.episodeId}`,
    description: episode.animeId.description || 'No description available',
    datePublished: episode.releaseDate,
    thumbnailUrl: thumbnailUrl,
    image: thumbnailUrl,
    duration: formatDuration(episode.duration),
    inLanguage: "ro",
    ...(Array.isArray((episode.animeId as any)?.actors) && (episode.animeId as any).actors.length > 0 && {
      actor: (episode.animeId as any).actors.map((actor: any) => ({
        "@type": "Person",
        name: actor.name
      }))
    }),
    ...((episode.animeId as any)?.director && {
      director: {
        "@type": "Person",
        name: (episode.animeId as any).director
      }
    }),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: episode.views || 0,
    },
  };
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

    // Validate mediaId
    if (!validateMediaId(mediaId)) {
      return {
        title: "Invalid Episode ID",
        description: "The episode ID is missing or invalid.",
      };
    }

    const cacheKey = `episode_metadata_${mediaId}`;
    let episode = await getCachedData<any>(cacheKey);

    if (!episode) {
      episode = await getEpisodeDetails(mediaId);
      if (episode) {
        await setCachedData(cacheKey, episode, 3600); // Cache for 1 hour
      }
    }

    if (!validateEpisode(episode)) {
      notFound();
    }

    const siteUrl = process.env.SITE_URL || "https://HentaiTerra.ro";
    const episodeTitle = `${episode.animeId.name} - Episodul ${episode.episodeNumber} - ${episode.name}`;
    const description = `Urmareste ${episodeTitle} pe HentaiTerra subtitrat in Romana`;
    const thumbnailUrl = resolveThumbnailUrl(episode.thumbnail, episode.animeId.poster, siteUrl);

    return {
      title: episodeTitle,
      description,
      keywords: generateKeywords(episode),
      metadataBase: new URL(siteUrl),
      openGraph: {
        url: `${siteUrl}/watch/${mediaId}`,
        type: "video.episode",
        title: episodeTitle,
        description,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra',
        locale: "ro_RO",
        images: [{
          url: thumbnailUrl,
          width: 1280,
          height: 720,
          alt: `Thumbnail for ${episodeTitle}`,
        }],
        ...(episode.duration && { duration: episode.duration }),
        ...(episode.releaseDate && { releaseDate: episode.releaseDate }),
        ...(episode.genres?.length && {
          tags: episode.genres.map((genre: Genre) => genre.name)
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: episodeTitle,
        description,
        images: [{
          url: thumbnailUrl,
          width: 1920,
          height: 1080,
          alt: `Thumbnail for ${episodeTitle}`,
        }],
        creator: "@HentaiTerra",
        site: "@HentaiTerra",
      },
      alternates: {
        canonical: `${siteUrl}/watch/${mediaId}`,
      },
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          "max-video-preview": "auto",
          "max-image-preview": "large",
        },
      },
      other: {
        "og:video:tag": episode.genres?.map((genre: Genre) => genre.name).join(", "),
        "og:video:series": episode.animeId.name,
        "og:video:episode": episode.episodeNumber.toString(),
        ...(episode.releaseDate && { "og:video:release_date": episode.releaseDate }),
        ...(episode.animeId.studio && {
          "og:video:actor": episode.animeId.studio,
          "og:video:director": episode.animeId.studio,
        }),
      },
    };
  } catch (error) {
    await logToDiscordWebhook(`Error generating metadata: ${error}`);
    return {
      title: "Error Loading Episode",
      description: "An error occurred while loading the episode.",
    };
  }
}

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

/**
 * Prepares media data object for rendering
 */
function prepareMediaData(episode: Episode) {
  return {
    id: episode.episodeId,
    title: episode.animeId.name,
    alternativeTitles: episode.animeId.alternativeTitles || [],
    synopsis: episode.animeId.description || 'No description available',
    posterPath: episode.animeId.poster || '',
    genres: (episode.genres || []).map((genre: any) => ({
      name: genre.name || 'Unknown',
      _id: genre._id ? genre._id.toString() : ''
    })),
    creator: episode.animeId.studio || 'Unknown Studio',
    releaseDate: episode.releaseDate ? new Date(episode.releaseDate).toLocaleDateString() : 'Unknown',
    uploadDate: episode.updateDate ? new Date(episode.updateDate).toLocaleDateString() : 'Unknown',
    censorship: episode.isCensored ? "Censored" as const : "Uncensored" as const,
    videoUrl: episode.videoUrl,
    videoUrlBackup: episode.videoUrlBackup,
    videoUrlBackup2: episode.videoUrlBackup2,
    videoUrlBackup3: episode.videoUrlBackup3,
    traducator: episode.traducator,
    encoder: episode.encoder,
    verificator: episode.verificator,
  };
}

/**
 * Finds adjacent episodes (previous and next)
 */
function getAdjacentEpisodes(episodes: Episode[], currentEpisodeId: string) {
  const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
  const currentIndex = sortedEpisodes.findIndex(ep => ep.episodeId === currentEpisodeId);

  if (currentIndex === -1) {
    return { sortedEpisodes, currentIndex, nextEpisode: null, previousEpisode: null };
  }

  return {
    sortedEpisodes,
    currentIndex,
    nextEpisode: sortedEpisodes[currentIndex + 1] || null,
    previousEpisode: sortedEpisodes[currentIndex - 1] || null,
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function WatchPage({
  params,
}: {
  params: Promise<{ mediaId: string }>;
}) {
  try {
    const { mediaId } = await params;

    // Validate mediaId
    if (!validateMediaId(mediaId)) {
      notFound();
    }

    // Fetch episode details
    const episodeCacheKey = `episode_details_${mediaId}`;
    let episode = await getCachedData<any>(episodeCacheKey);

    if (!episode) {
      episode = await getEpisodeDetails(mediaId);
      if (episode) {
        await setCachedData(episodeCacheKey, episode, 3600); // Cache for 1 hour
      }
    }

    // Validate episode data
    if (!episode) {
      console.error(`[WatchPage] Episode not found for mediaId: ${mediaId}`);
      notFound();
    }

    if (!validateEpisode(episode)) {
      console.error(`[WatchPage] Episode validation failed for mediaId: ${mediaId}`, {
        hasEpisodeId: !!episode.episodeId,
        hasAnimeId: !!episode.animeId,
        hasAnimeName: !!episode.animeId?.name,
        hasEpisodes: !!episode.animeId?.episodes,
        episodesIsArray: Array.isArray(episode.animeId?.episodes),
        hasEpisodeNumber: typeof episode.episodeNumber === 'number',
        hasVideoUrl: !!episode.videoUrl
      });
      notFound();
    }

    // Fetch recommended anime in parallel (non-blocking)
    const recommendedCacheKey = `recommended_anime_${episode.animeId._id}`;
    let recommendedAnimeData = await getCachedData<any[]>(recommendedCacheKey);

    if (!recommendedAnimeData) {
      recommendedAnimeData = await getRecommendedAnimes(episode.animeId._id.toString());
      if (recommendedAnimeData) {
        await setCachedData(recommendedCacheKey, recommendedAnimeData, 3600); // Cache for 1 hour
      }
    }
    const recommendedAnime = Array.isArray(recommendedAnimeData) ? recommendedAnimeData : [];

    // Validate episodes array
    const episodes = episode.animeId.episodes || [];
    if (!Array.isArray(episodes) || episodes.length === 0) {
      console.error(`[WatchPage] Episodes array is empty or not an array for mediaId: ${mediaId}. AnimeId: ${episode.animeId._id}`);
      // Don't 404 yet, try to proceed with just this episode
    }

    // Get adjacent episodes
    let { sortedEpisodes, currentIndex, nextEpisode, previousEpisode } =
      getAdjacentEpisodes(episodes.length > 0 ? episodes : [episode], episode.episodeId);

    if (currentIndex === -1) {
      console.warn(`[WatchPage] Current episode not found in episodes array for mediaId: ${mediaId}. Falling back to single episode list.`);
      sortedEpisodes = [episode];
      currentIndex = 0;
      nextEpisode = null;
      previousEpisode = null;
    }

    // Prepare data for rendering
    const episodeTitle = `${episode.animeId.name} - Episodul ${episode.episodeNumber} - ${episode.name || 'Untitled'}`;
    const mediaData = {
      ...prepareMediaData(episode),
      animeId: episode.animeId._id.toString(),
      mediaType: episode.animeId.mediaType,
      rating: episode.animeId.malid ? (episode.animeId.malid % 10).toFixed(1) : 'N/A',
      season: 'Spring 2026',
      status: episode.animeId.status
    };
    const siteUrl = process.env.SITE_URL || "https://HentaiTerra.ro";
    const thumbnailUrl = resolveThumbnailUrl(episode.thumbnail, mediaData.posterPath, siteUrl);

    // Generate structured data
    const jsonLd = generateVideoStructuredData(episode, episodeTitle, thumbnailUrl, siteUrl);
    const breadcrumbList = generateBreadcrumbStructuredData(episode, siteUrl);
    const episodeStructuredData = generateEpisodeStructuredData(episode, episodeTitle, thumbnailUrl, siteUrl);

    // Serialize episodes for client-side use
    const serializedEpisodes = sortedEpisodes.map(serializeEpisode);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
      <div className="min-h-screen text-gray-200">
        <div className="container mx-auto px-4 py-6 max-w-[1400px]">
          {/* SEO Meta Tags */}
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta httpEquiv="content-language" content="ro" />
          <link rel="canonical" href={`${siteUrl}/watch/${episode.episodeId}`} />

          {/* Structured Data */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeStructuredData) }} />

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span className="text-gray-700">/</span>
            <Link href="/hentais" className="hover:text-white transition-colors">HENTAI</Link>
            <span className="text-gray-700">/</span>
            <Link href={`/hentai/${episode.animeId._id}`} className="hover:text-white transition-colors uppercase">{episode.animeId.name}</Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-300 uppercase">EPISODE {episode.episodeNumber}</span>
          </nav>

          <div className="flex flex-col gap-8">
            {/* Top Section: Player and Episodes side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              <div className="space-y-4">
                {/* ── Video Player + Source Selector (self-contained) ── */}
                <VideoPlayerWithSources
                  episodeId={episode.episodeId}
                  videoUrl={mediaData.videoUrl}
                  videoUrlBackup={mediaData.videoUrlBackup || ''}
                  videoUrlBackup2={mediaData.videoUrlBackup2 || ''}
                  videoUrlBackup3={mediaData.videoUrlBackup3 || ''}
                  animeId={episode.animeId._id.toString()}
                  width={1920}
                  height={1080}
                  title={episodeTitle}
                  loading="lazy"
                  thumbnailUrl={thumbnailUrl}
                />

                {/* Player Controls/Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-400/50 backdrop-blur-xl p-5 rounded-2xl border border-white/5 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <h2 className="text-lg font-bold text-white leading-tight">Episode {episode.episodeNumber}</h2>
                      <p className="text-xs text-gray-500 font-medium">{episode.name || 'Unfading Resolve'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {previousEpisode && (
                      <Link
                        href={`/watch/${previousEpisode.episodeId}`}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 group"
                        title="Previous Episode"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Link>
                    )}
                    <Link
                      href={`/hentai/${episode.animeId._id}`}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-gray-300 border border-white/5 transition-all"
                    >
                      All Episodes
                    </Link>
                    {nextEpisode && (
                      <Link
                        href={`/watch/${nextEpisode.episodeId}`}
                        className="p-2.5 bg-primary-500 hover:bg-primary-600 rounded-lg transition-all shadow-lg shadow-primary-500/20 group"
                        title="Next Episode"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats & Actions */}
                <Suspense fallback={<LoadingButtons />}>
                  <ActionButtons
                    episodeId={episode.episodeId}
                    animeId={episode.animeId._id.toString()}
                    initialLikes={episode.likes || 0}
                    initialDislikes={episode.dislikes || 0}
                    views={episode.views || 0}
                    nume={episode.name || 'Untitled'}
                  />
                </Suspense>
              </div>

              {/* Episodes Side List */}
              <div className="bg-dark-400/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl ring-1 ring-white/5 overflow-hidden flex flex-col h-[400px] lg:h-auto lg:max-h-[calc(100vh-200px)]">
                <Suspense fallback={<LoadingEpisodes />}>
                  <EpisodePaginationWrapper
                    episodes={serializedEpisodes}
                    currentEpisodeId={episode.episodeId}
                    pageSize={50} // Show more in the side list
                  />
                </Suspense>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Main Content (Bottom) */}
              <div className="space-y-8">
                {/* Media Info */}
                <div className="bg-dark-400/30 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl ring-1 ring-white/5 flex flex-col">
                  <Suspense fallback={<LoadingInfo />}>
                    <MediaInfo media={mediaData} />
                  </Suspense>
                </div>

                {/* Comments */}
                <div className="bg-dark-400/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl ring-1 ring-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full shadow-[0_0_10px_rgba(var(--color-primary-500),0.5)]"></div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Comentarii
                    </h3>
                  </div>
                  <Suspense fallback={<LoadingComments />}>
                    <DisqusDiscussionEmbed
                      identifier={episode.episodeId}
                      title={episodeTitle}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Recommended */}
                {recommendedAnime.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-primary-500 rounded-full"></span>
                      Recommended
                    </h3>
                    <div className="flex flex-col gap-4">
                      {recommendedAnime.slice(0, 5).map((anime: any) => (
                        <Link
                          key={anime._id}
                          href={`/hentai/${anime._id}`}
                          className="flex gap-3 group"
                        >
                          <div className="relative w-20 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-white/5">
                            <Image
                              src={anime.poster || "/default-thumbnail.jpg"}
                              alt={anime.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-primary-400 transition-colors line-clamp-2 leading-tight mb-1">
                              {anime.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                              <span>{anime.episodeCount} EP</span>
                              <span>•</span>
                              <span>{anime.totalViews?.toLocaleString()} VIEWS</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in WatchPage:', error);
    notFound();
  }
}
