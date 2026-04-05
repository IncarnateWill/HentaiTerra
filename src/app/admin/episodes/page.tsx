"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { canManageContent } from "@/lib/admin-permissions";
import Link from "next/link";
import Image from "next/image";
import { Types } from "mongoose";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import EpisodeFormModal from "@/components/admin/EpisodeFormModal";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

interface Episode {
  _id: string;
  name?: string;
  displayTitle: string;
  episodeId: string;
  episodeNumber: number;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  videoUrlBackup: string;
  videoUrlBackup2: string;
  videoUrlBackup3: string;
  verificator: string;
  encoder: string;
  traducator: string;
  views: number;
  releaseDate: Date;
  updateDate: Date;
  isCensored: boolean;
  likes: number;
  dislikes: number;
  genres: Types.ObjectId[];
  animeId?: string;
  anime?: {
    _id: string;
    name: string;
    poster?: string;
  };
}

interface FilterOptions {
  search: string;
  animeId: string;
  hasTeam: boolean;
  hasThumbnail: boolean;
  hasVideo: boolean;
  sortBy: 'episodeNumber' | 'name' | 'animeName';
  sortOrder: 'asc' | 'desc';
}

export default function AdminEpisodesPage() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [animes, setAnimes] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editEpisode, setEditEpisode] = useState<Episode | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const PAGE_SIZE = 20;

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    animeId: '',
    hasTeam: false,
    hasThumbnail: false,
    hasVideo: false,
    sortBy: 'episodeNumber',
    sortOrder: 'asc'
  });

  const fetchUserRoles = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUserRoles(data.user?.roles || []);
      }
    } catch (error) {
      await logToDiscordWebhook(`Failed to fetch user roles: ${error}`);
    }
  };

  const fetchAnimes = async () => {
    try {
      const res = await fetch("/api/admin/anime?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setAnimes(data.animes || []);
      }
    } catch (error) {
      await logToDiscordWebhook(`Failed to fetch animes: ${error}`);
    }
  };

  const fetchEpisodes = useCallback(async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        perPage: String(PAGE_SIZE),
      });
      
      if (filters.search) params.set("search", filters.search);
      if (filters.animeId) params.set("animeId", filters.animeId);
      if (filters.hasTeam) params.set("hasTeam", "true");
      if (filters.hasThumbnail) params.set("hasThumbnail", "true");
      if (filters.hasVideo) params.set("hasVideo", "true");
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder);
      
      const res = await fetch(`/api/admin/episodes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAnimes();
    fetchEpisodes(1);
    fetchUserRoles();
  }, [fetchEpisodes]);

  useEffect(() => {
    fetchEpisodes(1);
    setPage(1);
  }, [filters, fetchEpisodes]);

  useEffect(() => {
    if (!filters.animeId) return;
    fetchEpisodes(page);
  }, [page, filters.animeId, fetchEpisodes]);

  const handleAdd = () => {
    setModalMode('add');
    setEditEpisode(null);
    setModalOpen(true);
  };

  const handleEdit = (ep: Episode) => {
    setModalMode('edit');
    setEditEpisode(ep);
    setModalOpen(true);
  };

  const handleDelete = async (episodeId: string) => {
    if (!window.confirm('Are you sure you want to delete this episode? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete episode');
      }
      await fetchEpisodes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete episode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalSubmit = async (episodeData: Episode) => {
    setActionLoading(true);
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/admin/episodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(episodeData),
        });
        if (!res.ok) throw new Error('Failed to add episode');
      } else if (modalMode === 'edit' && editEpisode) {
        const res = await fetch('/api/admin/episodes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...episodeData, _id: editEpisode._id }),
        });
        if (!res.ok) throw new Error('Failed to update episode');
      }
      setModalOpen(false);
      await fetchEpisodes();
    } catch (err: any) {
      alert(err.message || 'Failed to save episode');
    } finally {
      setActionLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      animeId: '',
      hasTeam: false,
      hasThumbnail: false,
      hasVideo: false,
      sortBy: 'episodeNumber',
      sortOrder: 'asc'
    });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    return duration;
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTeamMembers = (episode: Episode) => {
    const members = [];
    if (episode.verificator) members.push({ role: 'Verificator', name: episode.verificator, color: 'text-green-400' });
    if (episode.encoder) members.push({ role: 'Encoder', name: episode.encoder, color: 'text-blue-400' });
    if (episode.traducator) members.push({ role: 'Traducator', name: episode.traducator, color: 'text-purple-400' });
    return members;
  };

  const hasActiveFilters = () => {
    return filters.search || filters.animeId || filters.hasTeam || filters.hasThumbnail || filters.hasVideo;
  };

  if (loading && episodes.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Episode Management
          </h1>
          <p className="text-gray-400 mt-1">Manage all episodes across all anime series</p>
        </div>
        
        <button
          onClick={handleAdd}
          disabled={actionLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500 hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Episode
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search episodes..."
            className="w-full px-4 py-3 pl-10 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500 transition-colors"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-red-600 text-white border border-red-700 hover:bg-red-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Hentai Series</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500 transition-colors"
                  value={filters.animeId}
                  onChange={(e) => updateFilter('animeId', e.target.value)}
                >
                  <option value="">All Hentai</option>
                  {animes.map(anime => (
                    <option key={anime._id} value={anime._id}>{anime.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Sort By</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500 transition-colors"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as FilterOptions['sortBy'])}
                >
                  <option value="episodeNumber">Episode Number</option>
                  <option value="name">Episode Name</option>
                  {/* <option value="releaseDate">Release Date</option> */}
                  <option value="animeName">Hentai Name</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Sort Order</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('sortOrder', 'asc')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      filters.sortOrder === 'asc' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <SortAsc className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => updateFilter('sortOrder', 'desc')}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      filters.sortOrder === 'desc' 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    <SortDesc className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.hasTeam}
                      onChange={(e) => updateFilter('hasTeam', e.target.checked)}
                      className="rounded border-neutral-600 bg-neutral-800 text-purple-500 focus:ring-purple-500"
                    />
                    Has Team Members
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.hasThumbnail}
                      onChange={(e) => updateFilter('hasThumbnail', e.target.checked)}
                      className="rounded border-neutral-600 bg-neutral-800 text-purple-500 focus:ring-purple-500"
                    />
                    Has Thumbnail
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.hasVideo}
                      onChange={(e) => updateFilter('hasVideo', e.target.checked)}
                      className="rounded border-neutral-600 bg-neutral-800 text-purple-500 focus:ring-purple-500"
                    />
                    Has Video URL
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Play className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Episodes</p>
              <p className="text-2xl font-bold text-white">{total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">This Page</p>
              <p className="text-2xl font-bold text-white">{episodes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Page</p>
              <p className="text-2xl font-bold text-white">{page}/{totalPages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Per Page</p>
              <p className="text-2xl font-bold text-white">{PAGE_SIZE}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Grid */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error loading episodes</div>
          <div className="text-gray-400">{error}</div>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No episodes found</div>
          <div className="text-gray-500">
            {hasActiveFilters() ? 'Try adjusting your filters' : 'Start by adding your first episode'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {episodes.map((episode) => (
            <div
              key={episode._id}
              className="bg-neutral-900 rounded-xl border border-neutral-800 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-neutral-800 rounded-t-xl overflow-hidden">
                {episode.thumbnail ? (
                  <Image
                    src={episode.thumbnail}
                    alt={episode.displayTitle || episode.name || `Episode ${episode.episodeNumber}`}
                    width={300}
                    height={169}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Play className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                  EP {episode.episodeNumber}
                </div>
                {episode.anime && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {episode.anime.name.length > 15 ? episode.anime.name.substring(0, 15) + '...' : episode.anime.name}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {episode.displayTitle || episode.name || `Episode ${episode.episodeNumber}`}
                </h3>
                
                {episode.anime && (
                  <div className="mb-2">
                    <Link
                      href={`/admin/anime/${episode.anime._id}/episodes`}
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {episode.anime.name}
                    </Link>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(episode.duration)}</span>
                  </div>

                </div>

                {/* Team Members */}
                {getTeamMembers(episode).length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Users className="w-4 h-4" />
                      <span>Team</span>
                    </div>
                    <div className="space-y-1">
                      {getTeamMembers(episode).map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{member.role}:</span>
                          <Link
                            href={`/profile/${member.name}`}
                            className={`${member.color} hover:underline`}
                            target="_blank"
                          >
                            {member.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(episode)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {canManageContent({ roles: userRoles }) && (
                    <button
                      onClick={() => handleDelete(episode._id)}
                      disabled={actionLoading}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white border border-red-700 hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'}`}
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="First page"
            >
              &laquo;
            </button>
            <button
              className={`px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'}`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(pn => (
              <button
                key={pn}
                className={`px-4 py-2 rounded-lg ${pn === page ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-gray-200 hover:bg-neutral-700'} border border-neutral-700`}
                onClick={() => setPage(pn)}
                aria-current={pn === page ? 'page' : undefined}
              >
                {pn}
              </button>
            ))}
            <button
              className={`px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'}`}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            <button
              className={`px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'}`}
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              aria-label="Last page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

      {/* Episode Form Modal */}
      <EpisodeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(episode) => handleModalSubmit(episode as Episode)}
        episode={editEpisode}
        mode={modalMode}
        animeId={editEpisode?.animeId || ''}
        loading={actionLoading}
      />

      {/* Loading Indicator */}
      {actionLoading && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      )}
    </div>
  );
}
