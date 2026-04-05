"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { canManageContent } from "@/lib/admin-permissions";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Edit, Trash2, Play, Calendar, Clock, Users } from "lucide-react";
import { Types } from "mongoose";
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
  views: number;
  releaseDate: Date;
  updateDate: Date;
  isCensored: boolean;
  likes: number;
  dislikes: number;
  verificator: string;
  encoder: string;
  traducator: string;
  genres: Types.ObjectId[];
}

interface Anime {
  _id: string;
  name: string;
  poster?: string;
  genres?: { name: string }[];
}

export default function AdminEpisodesPage() {
  const { animeId } = useParams() as { animeId: string };
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editEpisode, setEditEpisode] = useState<Episode | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const PAGE_SIZE = 12;
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!animeId) return;
    fetchAnime();
    fetchEpisodes(1);
    setPage(1);
    // eslint-disable-next-line
  }, [animeId]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!animeId) return;
    fetchEpisodes(1);
    setPage(1);
    // eslint-disable-next-line
  }, [searchDebounced]);

  useEffect(() => {
    fetch("/api/user/profile").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUserRoles(data.user?.roles || []);
      }
    });
  }, []);

  const fetchAnime = async () => {
    try {
      const res = await fetch(`/api/admin/anime/${animeId}`);
      if (res.ok) {
        const data = await res.json();
        setAnime(data.anime);
      }
    } catch (error) {
      await logToDiscordWebhook(`Failed to fetch anime: ${error}`);
    }
  };

  const fetchEpisodes = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        animeId,
        page: String(pageNum),
        perPage: String(PAGE_SIZE),
      });
      if (searchDebounced) params.set("search", searchDebounced);
      
      const res = await fetch(`/api/admin/episodes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      await logToDiscordWebhook(`Failed to fetch episodes: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!animeId) return;
    fetchEpisodes(page);
    // eslint-disable-next-line
  }, [page]);

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
      await logToDiscordWebhook(`Failed to delete episode: ${err.message || 'Failed to delete episode'}`);
      alert(err.message || 'Failed to delete episode');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalSubmit = async (episodeData: Episode) => {
    setActionLoading(true);
    try {
      const payload = {
        ...episodeData,
        animeId,
      };
      
      if (modalMode === 'add') {
        const res = await fetch('/api/admin/episodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to add episode');
      } else if (modalMode === 'edit' && editEpisode) {
        const res = await fetch('/api/admin/episodes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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

  const formatDuration = (duration?: string) => {
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

  if (loading && episodes.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Episode Management
            </h1>
            {anime && (
              <p className="text-gray-400 mt-1">
                Managing episodes for: <span className="text-white font-medium">{anime.name}</span>
              </p>
            )}
          </div>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by episode number, title, or display title..."
            className="w-full px-4 py-3 pl-10 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-purple-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Play className="h-5 w-5 text-gray-400" />
          </div>
        </div>
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
          <div className="text-gray-500">Start by adding your first episode</div>
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
                    width={300}
                    height={160}
                    src={episode.thumbnail}
                    alt={episode.name || 'Episode thumbnail'}
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
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {episode.name}
                </h3>
                
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
                     onClick={() => window.open(`/watch/${episode.episodeId}`, '_blank')}
                     className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white border border-green-700 hover:bg-green-700 transition-colors font-medium"
                   >
                     <Play className="w-4 h-4" />
                     Watch
                   </button>
                  <button
                    onClick={() => handleEdit(episode)}
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        animeId={animeId}
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