import { auth } from '@clerk/nextjs/server';
import { getWatchlistByUserId, getWatchlistStats, cleanupOrphanedWatchlistEntries } from '@/lib/db-utils';
import { User } from '@/models';
import Link from 'next/link';
import { WatchlistClient } from "@/components/ui/WatchListClient";
import { Suspense } from 'react';
import { logToDiscordWebhook } from '@/lib/discord-webhook';

// Caching disabled for Cloudflare conflict diagnosis
// export const revalidate = 0;

export const metadata = {
  title: 'My Watchlist - HentaiUnited',
  description: 'Manage your hentai watchlist on HentaiUnited',
};

// Enhanced types with better type safety
const STATUS_ORDER = ['watching', 'plan-to-watch', 'on-hold', 'completed', 'dropped'] as const;
type Status = typeof STATUS_ORDER[number];

interface WatchlistItem {
  status: Status;
  animeId: {
    _id: string;
    poster: string;
    name: string;
    genres?: { _id: string; name: string }[];
    episodes?: { _id: string; episodeNumber: number; episodeId: string; name?: string }[];
    mediaType?: string;
    description?: string;
    studio?: string;
    year?: number;
  };
  watchedEpisodes?: string[];
  lastWatchedEpisode?: {
    _id: string;
    episodeNumber: number;
    name: string;
  } | null;
  _id?: string;
}

interface WatchlistData {
  animes?: WatchlistItem[];
}

// Enhanced status configuration with better visual hierarchy
const STATUS_CONFIG: Record<Status, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: string; 
  accent: string;
  description: string;
}> = {
  watching: { 
    label: 'Currently Watching', 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-500/10 border-emerald-400/20',
    accent: 'bg-emerald-400',
    icon: '▶️',
    description: 'Hentai you are actively watching'
  },
  'plan-to-watch': { 
    label: 'Plan to Watch', 
    color: 'text-sky-400', 
    bgColor: 'bg-sky-500/10 border-sky-400/20',
    accent: 'bg-sky-400',
    icon: '📋',
    description: 'Hentai you plan to watch later'
  },
  'on-hold': { 
    label: 'On Hold', 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10 border-amber-400/20',
    accent: 'bg-amber-400',
    icon: '⏸️',
    description: 'Hentai you paused watching'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-violet-400', 
    bgColor: 'bg-violet-500/10 border-violet-400/20',
    accent: 'bg-violet-400',
    icon: '✅',
    description: 'Hentai you finished watching'
  },
  dropped: { 
    label: 'Dropped', 
    color: 'text-rose-400', 
    bgColor: 'bg-rose-500/10 border-rose-400/20',
    accent: 'bg-rose-400',
    icon: '❌',
    description: 'Hentai you stopped watching'
  }
};

// Enhanced error card with better UX
const ErrorCard = ({ 
  title, 
  message, 
  showHomeLink = false,
  showRetry = false,
  onRetry
}: { 
  title: string; 
  message: string; 
  showHomeLink?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-rose-500/20 to-red-500/20 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-amber-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
            {showHomeLink && (
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-indigo-500/25"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Redesigned empty state with modern, actionable UI (no MAL import, no background)
const EmptyWatchlist = () => (
  <div className="w-full max-w-xl mx-auto bg-[#181828] border border-[#23233a] rounded-3xl shadow-2xl p-8 flex flex-col items-center mt-24">
    {/* Illustration */}
    <div className="w-32 h-32 mb-6 flex items-center justify-center bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-2xl border border-indigo-500/20">
      <svg className="w-20 h-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <rect x="8" y="12" width="32" height="24" rx="6" fill="#23233a" stroke="#6366f1" strokeWidth="2" />
        <path d="M16 20h16M16 28h8" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="28" r="2.5" fill="#a5b4fc" />
      </svg>
    </div>
    {/* Headline */}
    <h2 className="text-3xl font-extrabold text-white mb-2 text-center drop-shadow-lg">Watchlist-ul tău este gol!</h2>
    {/* Message */}
    <p className="text-gray-400 text-base mb-6 text-center max-w-md">
      Nu ai adăugat încă niciun hentai în watchlist. Descoperă titluri noi și începe să-ți urmărești progresul!
    </p>
    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-2">
      <Link
        href="/hentais"
        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 text-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Explore Hentai
      </Link>
    </div>
  </div>
);

// Enhanced data normalization with better error handling
const normalizeWatchlistData = (watchlistData: any): WatchlistData => {
  try {
    if (!watchlistData || !watchlistData.animes) {
      return { animes: [] };
    }

    return {
      animes: watchlistData.animes
        .filter((anime: any) => anime.animeId) // Filter out entries with null animeId
        .map((anime: any) => ({
          ...anime,
          animeId: {
            ...anime.animeId,
            _id: anime.animeId._id?.toString?.() || anime.animeId._id,
            episodes: (anime.animeId.episodes || []).map((ep: any) => ({
              ...ep,
              _id: ep._id?.toString?.() || ep._id,
            })),
            genres: Array.isArray(anime.animeId.genres)
              ? anime.animeId.genres.map((genre: any) => ({
                  ...genre,
                  _id: genre._id?.toString?.() || genre._id
                }))
              : [],
          },
          _id: anime._id?.toString?.() || anime._id,
          watchedEpisodes: anime.watchedEpisodes?.map((id: any) => id?.toString?.() || id) || [],
          lastWatchedEpisode: anime.lastWatchedEpisode 
            ? {
                _id: anime.lastWatchedEpisode._id?.toString?.() || anime.lastWatchedEpisode._id,
                episodeNumber: anime.lastWatchedEpisode.episodeNumber,
                name: anime.lastWatchedEpisode.name,
              }
            : null
        }))
    };
  } catch (error) {
logToDiscordWebhook(`Error normalizing watchlist data: ${error}`).catch(console.error);
    return { animes: [] };
  }
};

// Enhanced grouping with better type safety
const groupAnimesByStatus = (animes: WatchlistItem[]): Record<Status, WatchlistItem[]> => 
  STATUS_ORDER.reduce((acc, status) => {
    acc[status] = animes.filter(item => item.status === status);
    return acc;
  }, {} as Record<Status, WatchlistItem[]>);

// Enhanced User type definition
interface UserDocument {
  _id: string | { toString(): string };
  clerkId: string;
  __v: number;
}

// Loading component for better UX
const WatchlistLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <div className="container mx-auto px-6 py-16">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 animate-pulse">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Loading your watchlist...</h2>
        <p className="text-gray-400 text-sm">Please wait while we fetch your hentai collection.</p>
      </div>
    </div>
  </div>
);

export default async function WatchlistPage() {
  // Authentication check with better error handling
  const { userId } = await auth();
  if (!userId) {
    return (
      <ErrorCard 
        title="Authentication Required"
        message="Please sign in to access your watchlist and track your hentai progress."
        showHomeLink
      />
    );
  }

  try {
    // User lookup with proper typing and error handling
    const user = await User.findOne({ clerkId: userId })
      .select('_id')
      .lean() as UserDocument | null;

    if (!user) {
      return (
        <ErrorCard 
          title="Profile Not Found"
          message='Unable to load your profile. Please contact "incarnatewill" on Discord for assistance.'
          showHomeLink
        />
      );
    }

    // Ensure _id is converted to string
    const userIdString = typeof user._id === 'string' ? user._id : user._id.toString();

    // Watchlist data fetch and processing with error handling
    let [watchlistData, watchlistStats] = await Promise.all([
      getWatchlistByUserId(userIdString),
      getWatchlistStats(userIdString)
    ]);
    
    // Clean up orphaned entries if there are issues with the data
    if ((watchlistData as any)?.animes?.some((anime: any) => !anime.animeId)) {
      await cleanupOrphanedWatchlistEntries(userIdString);
      // Re-fetch data after cleanup
      [watchlistData, watchlistStats] = await Promise.all([
        getWatchlistByUserId(userIdString),
        getWatchlistStats(userIdString)
      ]);
    }
    
    const watchlist = normalizeWatchlistData(watchlistData);
    
    const totalAnimes = watchlist.animes?.length || 0;
    if (totalAnimes === 0) {
      return <EmptyWatchlist />;
    }

    const animesByStatus = groupAnimesByStatus(watchlist.animes!);      
    
    return (
      <Suspense fallback={<WatchlistLoading />}>
        <WatchlistClient 
          animesByStatus={animesByStatus}
          statusConfig={STATUS_CONFIG}
          statusOrder={STATUS_ORDER}
          totalAnimes={totalAnimes}
          userId={userIdString}
          stats={watchlistStats}
        />
      </Suspense>
    );
  } catch (error) {
    await logToDiscordWebhook(`Error in WatchlistPage: ${error}`);
    return (
      <ErrorCard 
        title="Something Went Wrong"
        message="We encountered an error while loading your watchlist. Please try again later."
        showHomeLink
        showRetry
      />
    );
  }
}