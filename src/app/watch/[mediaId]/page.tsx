import { Metadata } from "next";
import { getEpisodeDetails, getRecommendedAnimes } from "@/lib/db-utils";
import dynamic from 'next/dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";
import EpisodePaginationWrapper from "@/components/video/EpisodePaginationWrapper";
import FAQ, { watchPageFAQ } from "@/components/shared/FAQ";
import AdditionalNavigation, { mainNavigationLinks } from "@/components/shared/AdditionalNavigation";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

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

const VideoPlayer = dynamic(() => import("@/components/video/video-player"), {
  loading: () => <LoadingVideo />,
  ssr: true
});

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

const AutoWatchMarker = dynamic(() => import("@/components/video/auto-watch-marker"), {
  loading: () => <LoadingButtons />,
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
    episode.animeId.episodes &&
    Array.isArray(episode.animeId.episodes) &&
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

/**
 * Generates TVSeries structured data for SEO
 */
function generateSeriesStructuredData(episode: Episode, thumbnailUrl: string, siteUrl: string, totalEpisodes: number) {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: episode.animeId.name,
    url: `${siteUrl}/hentai/${episode.animeId._id}`,
    description: episode.animeId.description || 'No description available',
    image: episode.animeId.poster || thumbnailUrl,
    genre: (episode.genres || []).map(g => g.name),
    creator: {
      "@type": "Organization",
      name: episode.animeId.studio || "Unknown Studio"
    },
    inLanguage: "ro",
    numberOfEpisodes: totalEpisodes,
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

    const episode = await getEpisodeDetails(mediaId);

    if (!validateEpisode(episode)) {
      notFound();
    }

    const siteUrl = process.env.SITE_URL || "https://hentaiterra.ro";
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
  searchParams,
}: {
  params: Promise<{ mediaId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  try {
    const { mediaId } = await params;
    
    // Validate mediaId
    if (!validateMediaId(mediaId)) {
      notFound();
    }

    // Fetch episode details
    const episode = await getEpisodeDetails(mediaId);

    // Validate episode data
    if (!episode || !validateEpisode(episode)) {
      notFound();
    }

    // Fetch recommended anime in parallel (non-blocking)
    const recommendedAnime = await getRecommendedAnimes(episode.animeId._id.toString());

    // Validate episodes array
    const episodes = episode.animeId.episodes || [];
    if (!Array.isArray(episodes) || episodes.length === 0) {
      notFound();
    }

    // Get adjacent episodes
    const { sortedEpisodes, currentIndex, nextEpisode, previousEpisode } = 
      getAdjacentEpisodes(episodes, episode.episodeId);
    
    if (currentIndex === -1) {
      notFound();
    }

    // Prepare data for rendering
    const episodeTitle = `${episode.animeId.name} - Episodul ${episode.episodeNumber} - ${episode.name || 'Untitled'}`;
    const mediaData = prepareMediaData(episode);
    const siteUrl = process.env.SITE_URL || "https://hentaiterra.ro";
    const thumbnailUrl = resolveThumbnailUrl(episode.thumbnail, mediaData.posterPath, siteUrl);

    // Generate structured data
    const jsonLd = generateVideoStructuredData(episode, episodeTitle, thumbnailUrl, siteUrl);
    const breadcrumbList = generateBreadcrumbStructuredData(episode, siteUrl);
    const episodeStructuredData = generateEpisodeStructuredData(episode, episodeTitle, thumbnailUrl, siteUrl);
    const seriesStructuredData = generateSeriesStructuredData(episode, thumbnailUrl, siteUrl, sortedEpisodes.length);

    // Serialize episodes for client-side use
    const serializedEpisodes = sortedEpisodes.map(serializeEpisode);

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center">
        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta httpEquiv="content-language" content="ro" />
        <link rel="canonical" href={`${siteUrl}/watch/${episode.episodeId}`} />
        <link rel="alternate" hrefLang="ro" href={`${siteUrl}/watch/${episode.episodeId}`} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(episodeStructuredData) }}
        />

        <div className="w-full max-w-8xl flex flex-col gap-8 items-center justify-center">
          <div className="w-full flex flex-col gap-6 items-center justify-center">
            
            {/* Video Player Section */}
            <div className="rounded-2xl bg-gradient-to-br from-background-secondary/90 to-background-tertiary/90 border border-primary-500/30 shadow-xl p-4 md:p-8 w-full">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary-300 via-text-primary to-primary-300 bg-clip-text text-transparent text-center">
                {episodeTitle}
              </h1>
              
              <div className="relative aspect-video bg-dark-300 rounded-xl overflow-hidden mb-4">
                <Suspense fallback={<LoadingVideo />}>
                  <VideoPlayer
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
                </Suspense>
                
                <Suspense fallback={<LoadingButtons />}>
                  <AutoWatchMarker 
                    episodeId={episode.episodeId}
                    animeId={episode.animeId._id.toString()}
                  />
                </Suspense>
              </div>

              {/* Episode Navigation */}
              <nav className="flex justify-between items-center my-3 gap-2">
                <div className="flex gap-2">
                  {previousEpisode && (
                    <Link
                      href={`/watch/${previousEpisode.episodeId}`}
                      className="px-4 py-2 bg-gradient-to-r from-primary-700 to-secondary-700 text-text-primary rounded-full hover:from-primary-800 hover:to-secondary-800 transition shadow-md"
                    >
                      ← Ep. {previousEpisode.episodeNumber}
                    </Link>
                  )}
                  {episode.animeId._id && (
                    <Link
                      href={`/hentai/${episode.animeId._id}`}
                      className="px-4 py-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-text-primary rounded-full hover:from-secondary-700 hover:to-primary-700 transition shadow-md"
                    >
                      Hentai
                    </Link>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {nextEpisode && (
                    <Link
                      href={`/watch/${nextEpisode.episodeId}`}
                      className="px-4 py-2 bg-gradient-to-r from-primary-700 to-secondary-700 text-text-primary rounded-full hover:from-primary-800 hover:to-secondary-800 transition shadow-md"
                    >
                      Ep. {nextEpisode.episodeNumber} →
                    </Link>
                  )}
                </div>
              </nav>

              {/* Action Buttons (Like/Dislike/Views) */}
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

            {/* Episodes List */}
            <div className="rounded-2xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/80 border border-primary-500/20 shadow-lg p-4 md:p-6 w-full">
              <Suspense fallback={<LoadingEpisodes />}>
                <EpisodePaginationWrapper
                  episodes={serializedEpisodes}
                  currentEpisodeId={episode.episodeId}
                />
              </Suspense>
            </div>

            {/* Media Info */}
            <div className="rounded-2xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/80 border border-primary-500/20 shadow-lg p-4 md:p-6 w-full">
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
                  traducator: mediaData.traducator || 'Unknown',
                  encoder: mediaData.encoder || 'Unknown',
                  verificator: mediaData.verificator || 'Unknown',
                  animeId: episode.animeId._id.toString(),
                  status: (episode.animeId.status || '').toLowerCase()
                }} />
              </Suspense>
            </div>

            {/* Comments Section */}
            <div className="rounded-2xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/80 border border-primary-500/20 shadow-lg p-4 md:p-6 w-full">
              <Suspense fallback={<LoadingComments />}>
                <DisqusDiscussionEmbed
                  identifier={episode.episodeId}
                  title={episodeTitle}
                />
              </Suspense>
            </div>

            {/* FAQ Section */}
            <FAQ 
              title="Întrebări Frecvente - Vizionare"
              items={watchPageFAQ}
            />

            {/* Navigation Links */}
            <AdditionalNavigation 
              title="Navigare Rapidă"
              links={mainNavigationLinks}
            />
          </div>

          {/* Recommended Anime Section */}
          {recommendedAnime.length > 0 && (
            <div className="w-full max-w-8xl mt-8 rounded-2xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/80 border border-primary-500/20 shadow-lg p-4 md:p-6">
              <h2 className="text-2xl font-bold mb-4 text-text-primary">Serii Recomandate</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendedAnime.slice(0, 6).map((anime: any) => (
                  <a 
                    key={anime._id} 
                    href={`/hentai/${anime._id}`}
                    className="block group hover:opacity-90 transition-all duration-300"
                  >
                    <div className="relative pb-[140%] overflow-hidden rounded-lg bg-dark-300 shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                      <Image 
                        src={anime.poster || "/default-thumbnail.jpg"} 
                        alt={anime.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        fill
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-text-primary">
                          <p className="text-sm font-medium truncate">{anime.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                            <span>{anime.episodeCount} episoade</span>
                            <span>•</span>
                            <span>{(anime.totalViews || 0).toLocaleString()} vizualizări</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {anime.genres.slice(0, 2).map((genre: any) => (
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
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // Log errors but don't expose them to users
    // console.log('Error in WatchPage:', error);
    notFound();
  }
}
