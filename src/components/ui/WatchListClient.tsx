'use client';

import React, { useState, useTransition, Fragment, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Transition, Dialog, MenuButton, MenuItem, MenuItems, DialogPanel, DialogTitle } from '@headlessui/react';
import { useDebounce } from '@/hooks/use-debounce';

const statusOrder = ['watching', 'plan-to-watch', 'on-hold', 'completed', 'dropped'] as const;
type Status = typeof statusOrder[number];

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

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  accent: string;
  description: string;
}

interface WatchlistStats {
  totalAnime: number;
  totalEpisodes: number;
  watchedEpisodes: number;
  completedAnime: number;
  watchingAnime: number;
  planToWatchAnime: number;
  onHoldAnime: number;
  droppedAnime: number;
  averageProgress: number;
}

interface WatchlistClientProps {
  animesByStatus: Record<Status, WatchlistItem[]>;
  statusConfig: Record<Status, StatusConfig>;
  statusOrder: readonly Status[];
  totalAnimes: number;
  userId: string;
  stats?: WatchlistStats;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Enhanced AnimeCard with better UX and features
function AnimeCard({
  item,
  onStatusChange,
  onRemove,
  isPending,
  isSelected,
  onSelect,
  showCheckbox = false,
  viewMode = 'grid'
}: {
  item: WatchlistItem;
  onStatusChange: (animeId: string, status: Status) => void;
  onRemove: (animeId: string) => void;
  isPending: boolean;
  isSelected?: boolean;
  onSelect?: (animeId: string, selected: boolean) => void;
  showCheckbox?: boolean;
  viewMode?: 'grid' | 'list';
}) {
  const totalEpisodes = item.animeId.episodes?.length || 0;
  const watchedCount = item.watchedEpisodes?.length || 0;
  const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

  // Find last episode info
  let lastEpisodeNumber = null;
  let lastEpisodeName = '';
  if (item.animeId.episodes && item.animeId.episodes.length > 0) {
    const lastEp = item.animeId.episodes.reduce((max, ep) => ep.episodeNumber > max.episodeNumber ? ep : max, item.animeId.episodes[0]);
    lastEpisodeNumber = lastEp.episodeNumber;
    lastEpisodeName = lastEp.name || '';
  }

  let nextEpisodeLink = `/hentai/${item.animeId._id}`;
  if (item.animeId.episodes && item.animeId.episodes.length > 0) {
    const sortedEpisodes = [...item.animeId.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
    if (item.lastWatchedEpisode) {
      const lastWatchedIndex = sortedEpisodes.findIndex(ep => ep._id === item.lastWatchedEpisode?._id);
      if (lastWatchedIndex > -1 && lastWatchedIndex < sortedEpisodes.length - 1) {
        nextEpisodeLink = `/watch/${sortedEpisodes[lastWatchedIndex + 1].episodeId}`;
      }
    } else {
      nextEpisodeLink = `/watch/${sortedEpisodes[0].episodeId}`;
    }
  }

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(item.animeId._id, !isSelected);
    }
  }, [onSelect, item.animeId._id, isSelected]);

  return (
    <div className={classNames(
      "bg-neutral-900/90 border rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 flex flex-col h-full relative group overflow-hidden",
      isSelected ? "border-indigo-500 ring-2 ring-indigo-500/50" : "border-neutral-800 hover:border-neutral-700",
      isPending ? "opacity-50" : "",
      viewMode === 'list' ? "flex-row" : ""
    )}>
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-50">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="w-5 h-5 text-indigo-600 bg-neutral-800 border-neutral-600 rounded focus:ring-indigo-500 focus:ring-2"
          />
        </div>
      )}
      
      {/* Image - only show in grid mode */}
      {viewMode === 'grid' && (
        <div className="relative w-full aspect-[2/3] rounded-t-2xl overflow-hidden">
          <Image
            src={item.animeId.poster || "/default-thumbnail.jpg"}
            alt={item.animeId.name}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 250px"
          />
          <div className="absolute top-2 left-2 bg-neutral-800/80 text-white text-xs px-2 py-1 rounded-full shadow">
            {item.animeId.mediaType || 'TV'}
          </div>
          <div className="absolute top-2 right-2 z-50">
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="p-2 bg-zinc-800/80 rounded-full hover:bg-indigo-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="10" cy="4" r="2" />
                  <circle cx="10" cy="10" r="2" />
                  <circle cx="10" cy="16" r="2" />
                </svg>
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-1 py-1">
                    {statusOrder.map(status => (
                      <MenuItem key={status}>
                        {({ active }: { active: boolean }) => (
                          <button
                            onClick={() => onStatusChange(item.animeId._id, status)}
                            className={classNames(
                              active ? 'bg-indigo-600 text-white' : 'text-zinc-200',
                              'group flex rounded-md items-center w-full px-2 py-2 text-sm font-medium transition-colors duration-150'
                            )}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </div>
                  <div className="px-1 py-1">
                    <MenuItem>
                      {({ active }: { active: boolean }) => (
                        <button
                          onClick={() => onRemove(item.animeId._id)}
                          className={classNames(
                            active ? 'bg-rose-600 text-white' : 'text-rose-400',
                            'group flex rounded-md items-center w-full px-2 py-2 text-sm font-medium transition-colors duration-150'
                          )}
                        >
                          Remove
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
          
          {/* Progress overlay */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex items-center gap-2 text-white text-xs">
                <div className="flex-1 bg-neutral-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className={classNames(
        "flex-1 flex flex-col gap-2",
        viewMode === 'grid' ? "p-5 bg-neutral-950/80" : "p-4"
      )}>
        <div className={viewMode === 'list' ? "flex items-center justify-between" : ""}>
          <h3 className={classNames(
            "font-bold text-white w-full line-clamp-2",
            viewMode === 'list' ? "text-lg" : "text-xl mb-1"
          )} title={item.animeId.name}>
            {item.animeId.name}
          </h3>
          
          {/* Menu for list mode */}
          {viewMode === 'list' && (
            <div className="ml-4">
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton className="p-2 bg-zinc-800/80 rounded-full hover:bg-indigo-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="4" r="2" />
                    <circle cx="10" cy="10" r="2" />
                    <circle cx="10" cy="16" r="2" />
                  </svg>
                </MenuButton>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-1 py-1">
                      {statusOrder.map(status => (
                        <MenuItem key={status}>
                          {({ active }: { active: boolean }) => (
                            <button
                              onClick={() => onStatusChange(item.animeId._id, status)}
                              className={classNames(
                                active ? 'bg-indigo-600 text-white' : 'text-zinc-200',
                                'group flex rounded-md items-center w-full px-2 py-2 text-sm font-medium transition-colors duration-150'
                              )}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                    <div className="px-1 py-1">
                      <MenuItem>
                        {({ active }: { active: boolean }) => (
                          <button
                            onClick={() => onRemove(item.animeId._id)}
                            className={classNames(
                              active ? 'bg-rose-600 text-white' : 'text-rose-400',
                              'group flex rounded-md items-center w-full px-2 py-2 text-sm font-medium transition-colors duration-150'
                            )}
                          >
                            Remove
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
        
        {item.animeId.studio && (
          <div className="text-xs text-gray-400 mb-1">
            <span className="font-semibold">Studio:</span> {item.animeId.studio}
          </div>
        )}
        
        {lastEpisodeNumber !== null && (
          <div className="text-xs text-indigo-300 mb-1">
            <span className="font-semibold">Last episode:</span> Ep {lastEpisodeNumber}{lastEpisodeName ? ` – ${lastEpisodeName}` : ''}
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-2">
          {(item.animeId.genres || []).slice(0, 3).map((genre) => (
            <span key={genre._id} className="px-2 py-0.5 bg-indigo-600/20 text-indigo-200 text-xs rounded-full font-semibold">
              {genre.name}
            </span>
          ))}
        </div>
        
        {totalEpisodes > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{watchedCount}/{totalEpisodes} episodes</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {item.lastWatchedEpisode && (
          <p className="text-xs text-gray-400 truncate">
            Last watched: Ep {item.lastWatchedEpisode.episodeNumber} – {item.lastWatchedEpisode.name}
          </p>
        )}
        
        {viewMode === 'grid' && <div className="flex-1" />}
        
        <div className={viewMode === 'list' ? "flex gap-2 mt-2" : "mt-3 flex gap-2"}>
          <Link 
            href={nextEpisodeLink} 
            className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-base font-semibold shadow-md w-full"
          >
            {watchedCount > 0 ? "Continue" : "Watch Now"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Bulk operations modal
function BulkOperationsModal({
  isOpen,
  onClose,
  selectedAnimes,
  onBulkStatusChange,
  onBulkRemove
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAnimes: string[];
  onBulkStatusChange: (status: Status) => void;
  onBulkRemove: () => void;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800">
          <DialogTitle className="text-xl font-bold text-white mb-4">
            Bulk Operations ({selectedAnimes.length} anime)
          </DialogTitle>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Change Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {statusOrder.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onBulkStatusChange(status);
                      onClose();
                    }}
                    className="px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-neutral-800 pt-4">
              <button
                onClick={() => {
                  onBulkRemove();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-semibold"
              >
                Remove All Selected
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export function WatchlistClient({
  animesByStatus: initialAnimesByStatus,
  statusConfig,
  statusOrder,
  totalAnimes,
  userId,
  stats
}: WatchlistClientProps) {
  const [activeFilter, setActiveFilter] = useState<Status | 'all'>('all');
  const [animesByStatus, setAnimesByStatus] = useState(initialAnimesByStatus);
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimes, setSelectedAnimes] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'recent'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 12 : 8;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Enhanced filtering and searching
  const getFilteredAnimes = useMemo(() => {
    let filtered = activeFilter === 'all' 
      ? statusOrder.flatMap(status => animesByStatus[status])
      : animesByStatus[activeFilter];

    // Search filtering
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(anime => 
        anime.animeId.name.toLowerCase().includes(query) ||
        anime.animeId.studio?.toLowerCase().includes(query) ||
        anime.animeId.genres?.some(genre => genre.name.toLowerCase().includes(query))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.animeId.name.localeCompare(b.animeId.name);
        case 'progress':
          const progressA = a.watchedEpisodes?.length || 0;
          const progressB = b.watchedEpisodes?.length || 0;
          return progressB - progressA;
        case 'recent':
          const lastWatchedA = a.lastWatchedEpisode?.episodeNumber || 0;
          const lastWatchedB = b.lastWatchedEpisode?.episodeNumber || 0;
          return lastWatchedB - lastWatchedA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [animesByStatus, activeFilter, debouncedSearchQuery, sortBy, statusOrder]);

  const totalPages = Math.ceil(getFilteredAnimes.length / ITEMS_PER_PAGE) || 1;
  const paginatedAnimes = getFilteredAnimes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Enhanced status update with optimistic updates
  const updateAnimeStatus = async (animeId: string, newStatus: Status) => {
    startTransition(() => {
      let movedAnime: WatchlistItem | null = null;
      const updatedAnimesByStatus = { ...animesByStatus };
      
      for (const status of statusOrder) {
        const animeIndex = updatedAnimesByStatus[status].findIndex(
          item => item.animeId._id === animeId
        );
        if (animeIndex !== -1) {
          movedAnime = { ...updatedAnimesByStatus[status][animeIndex], status: newStatus };
          updatedAnimesByStatus[status].splice(animeIndex, 1);
          break;
        }
      }
      
      if (movedAnime) {
        updatedAnimesByStatus[newStatus].unshift(movedAnime);
      }
      
      setAnimesByStatus(updatedAnimesByStatus);
    });

    try {
      await fetch('/api/watchlist/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, status: newStatus }),
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      setAnimesByStatus(initialAnimesByStatus);
    }
  };

  // Enhanced remove with optimistic updates
  const removeAnime = async (animeId: string) => {
    startTransition(() => {
      const updatedAnimesByStatus = { ...animesByStatus };
      for (const status of statusOrder) {
        updatedAnimesByStatus[status] = updatedAnimesByStatus[status].filter(
          item => item.animeId._id !== animeId
        );
      }
      setAnimesByStatus(updatedAnimesByStatus);
      setSelectedAnimes(prev => {
        const newSet = new Set(prev);
        newSet.delete(animeId);
        return newSet;
      });
    });

    try {
      await fetch('/api/watchlist/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
    } catch (error) {
      console.error('Failed to remove anime:', error);
      setAnimesByStatus(initialAnimesByStatus);
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (status: Status) => {
    const promises = Array.from(selectedAnimes).map(animeId => 
      updateAnimeStatus(animeId, status)
    );
    await Promise.all(promises);
    setSelectedAnimes(new Set());
  };

  const handleBulkRemove = async () => {
    const promises = Array.from(selectedAnimes).map(animeId => 
      removeAnime(animeId)
    );
    await Promise.all(promises);
    setSelectedAnimes(new Set());
  };

  const handleSelectAnime = (animeId: string, selected: boolean) => {
    setSelectedAnimes(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(animeId);
      } else {
        newSet.delete(animeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedAnimes.size === paginatedAnimes.length) {
      setSelectedAnimes(new Set());
    } else {
      setSelectedAnimes(new Set(paginatedAnimes.map(anime => anime.animeId._id)));
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, debouncedSearchQuery, sortBy]);

  return (
    <div>
      <div className="max-w-7xl mx-auto w-full px-4 pt-10 pb-8">
        {/* Enhanced Header */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 text-center drop-shadow-lg tracking-tight">
            My Watchlist
          </h1>
          <p className="text-gray-400 text-lg mb-4 text-center">
            Track your hentai journey and continue where you left off.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            {totalAnimes} hentais in your collection
          </div>
          
          {/* Statistics Display */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full max-w-4xl">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.watchingAnime}</div>
                <div className="text-xs text-gray-400">Watching</div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-violet-400">{stats.completedAnime}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-sky-400">{stats.planToWatchAnime}</div>
                <div className="text-xs text-gray-400">Plan to Watch</div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.onHoldAnime}</div>
                <div className="text-xs text-gray-400">On Hold</div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search hentai, studio, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
                <option value="recent">Sort by Recent</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={classNames(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                  )}
                >
                  List
                </button>
              </div>
            </div>

            {/* Bulk Operations */}
            {selectedAnimes.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Bulk Actions ({selectedAnimes.size})
                </button>
                <button
                  onClick={() => setSelectedAnimes(new Set())}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              key="all"
              onClick={() => setActiveFilter('all')}
              className={classNames(
                'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-base md:text-md transition-all duration-200 border-2 shadow-sm',
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                  : 'bg-zinc-800 text-zinc-300 border-transparent hover:bg-indigo-600 hover:text-white'
              )}
            >
              <span>All</span>
              <span className="bg-indigo-700/20 text-indigo-200 text-xs font-bold px-2 py-1 rounded-full">
                {getFilteredAnimes.length}
              </span>
            </button>
            {statusOrder.map((status) => {
              const config = statusConfig[status];
              const isActive = activeFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={classNames(
                    'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-base md:text-md transition-all duration-200 border-2 shadow-sm',
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                      : 'bg-zinc-800 text-zinc-300 border-transparent hover:bg-indigo-600 hover:text-white'
                  )}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span>{config.label.replace('Currently ', '')}</span>
                  <span className="bg-indigo-700/20 text-indigo-200 text-xs font-bold px-2 py-1 rounded-full">
                    {animesByStatus[status].length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info */}
        {getFilteredAnimes.length > 0 && (
          <div className="flex items-center justify-between mb-6 text-sm text-gray-400">
            <span>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, getFilteredAnimes.length)} of {getFilteredAnimes.length} results
            </span>
            {paginatedAnimes.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {selectedAnimes.size === paginatedAnimes.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        )}

        {/* Enhanced Grid/List */}
        <div className={classNames(
          'transition-opacity duration-300',
          isPending ? 'opacity-50' : 'opacity-100',
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {paginatedAnimes.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-6 opacity-50">📺</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {searchQuery ? 'No anime found' : 'No anime in this category'}
              </h2>
              <p className="text-gray-400 mb-8">
                {searchQuery 
                  ? `No hentai found matching "${searchQuery}"`
                  : 'Start building your collection by adding some hentai!'
                }
              </p>
              <Link
                href="/hentais"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg"
              >
                Browse Hentai
              </Link>
            </div>
          ) : (
            paginatedAnimes.map((item) => (
              <AnimeCard
                key={item.animeId._id}
                item={item}
                onStatusChange={updateAnimeStatus}
                onRemove={removeAnime}
                isPending={isPending}
                isSelected={selectedAnimes.has(item.animeId._id)}
                onSelect={handleSelectAnime}
                showCheckbox={selectedAnimes.size > 0}
                viewMode={viewMode}
              />
            ))
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 pb-8 mt-8">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={classNames(
                'px-3 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm',
                currentPage === 1
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
              )}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={classNames(
                'px-3 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm',
                currentPage === 1
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
              )}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={classNames(
                      'px-3 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm',
                      page === currentPage
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-indigo-600 hover:text-white'
                    )}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={classNames(
                'px-3 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm',
                currentPage === totalPages
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
              )}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={classNames(
                'px-3 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm',
                currentPage === totalPages
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow'
              )}
            >
              Last
            </button>
          </div>
        )}
      </div>

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedAnimes={Array.from(selectedAnimes)}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkRemove={handleBulkRemove}
      />
    </div>
  );
}