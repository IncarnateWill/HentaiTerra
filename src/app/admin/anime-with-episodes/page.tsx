"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { canManageContent } from "@/lib/admin-permissions";

interface Anime {
  _id: string;
  name: string;
  poster?: string;
  genres?: { name: string }[];
  episodes?: number;
  mediaType?: string;
  year?: number;
  status?: string;
}

const PAGE_SIZE = 20;

export default function AnimeWithEpisodesPage() {
  const router = useRouter();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/user/profile").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        const roles = data.user?.roles || [];
        setUserRoles(roles);
        setHasPermission(!!canManageContent({ roles }));
      }
    });
  }, []);

  const fetchAnimes = async (pageNum = page, searchTerm = searchDebounced) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        perPage: String(PAGE_SIZE),
      });
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/admin/anime?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch anime");
      const data = await res.json();
      setAnimes(data.animes || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimes(1, searchDebounced);
    setPage(1);
    // eslint-disable-next-line
  }, [searchDebounced]);

  useEffect(() => {
    fetchAnimes(page, searchDebounced);
    // eslint-disable-next-line
  }, [page]);

  const handleManageEpisodes = (animeId: string) => {
    router.push(`/admin/anime/${animeId}/episodes`);
  };

  const handleViewAnime = (animeId: string) => {
    router.push(`/admin/anime/${animeId}`);
  };

  return (
    <div className="space-y-6">
      {!hasPermission ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <p className="text-red-400 text-lg mb-2">Access Denied</p>
          <p className="text-slate-400">You don&apos;t have permission to access this page.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Hentai with Episodes
              </h1>
              <p className="text-slate-400 mt-2">Browse and manage hentai that have episodes available</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search hentai by title, genre, or status..."
                  className="w-full pl-4 pr-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-400">
                {total} hentai titles found
              </div>
            </div>
          </div>

          {/* Anime Grid */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading hentai...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-400 text-lg mb-2">Error loading hentai</p>
                <p className="text-slate-400">{error}</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎬</span>
                      <span className="text-slate-300 font-medium">Hentai Library ({total})</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      Page {page} of {totalPages}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animes.map(anime => (
                      <div
                        key={anime._id}
                        className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 hover:border-blue-500/40 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="p-4 space-y-4">
                          {/* Poster */}
                          <div className="relative">
                            {anime.poster ? (
                              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-800">
                                <Image
                                  src={anime.poster}
                                  alt={anime.name}
                                  width={300}
                                  height={192}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                <span className="text-4xl">🎬</span>
                              </div>
                            )}
                            
                            {/* Status Badge */}
                            {anime.status && (
                              <div className="absolute top-2 right-2">
                                {(() => {
                                  const s = (anime.status || '').toLowerCase();
                                  const cls =
                                    s === 'ongoing' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                    s === 'finished' || s === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                    s === 'upcoming' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                    s === 'dropped' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                    s === 'cancelled' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                    s === 'in-traducere' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                    'bg-slate-500/20 text-slate-300 border border-slate-500/30';
                                  const label = (anime.status || '').replace(/-/g, ' ');
                                  return (
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${cls}`}>
                                      {label}
                                    </span>
                                  );
                                })()}
                              </div>
                          )}
                          </div>

                          {/* Content */}
                          <div className="space-y-3">
                            <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight">
                              {anime.name}
                            </h3>
                            
                            {anime.year && (
                              <p className="text-sm text-slate-400">{anime.year}</p>
                            )}
                            
                            {anime.genres && anime.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {anime.genres.slice(0, 2).map((genre, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-slate-600/50 text-slate-300 text-xs rounded-full">
                                    {genre.name}
                                  </span>
                                ))}
                                {anime.genres.length > 2 && (
                                  <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                                    +{anime.genres.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {anime.mediaType && (
                              <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                {anime.mediaType}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                              onClick={() => handleManageEpisodes(anime._id)}
                            >
                              Manage Episodes
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
                  <div className="text-slate-400">
                    Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} anime
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
