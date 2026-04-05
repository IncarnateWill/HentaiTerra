"use client";

import React, { useEffect, useState } from "react";
import AnimeFormModal from "@/components/admin/AnimeFormModal";
import { canManageContent } from "@/lib/admin-permissions";
import Image from "next/image";


interface AnimeRow {
  _id: string;
  title: string;
  synopsis: string;
  genres: { name: string }[];
  poster: string;
  year?: number;
  status?: string;
  type?: string;
  episodes?: number;
  studios?: { name: string }[];
  mediaType: string;
  name: string;
  alternativeTitles?: string[];
  malid?: number;
}

const PAGE_SIZE = 10;

export default function AdminAnimePage() {
  const [anime, setAnime] = useState<AnimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editAnime, setEditAnime] = useState<AnimeRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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


  const fetchAnime = async (pageNum = page, searchTerm = searchDebounced) => {
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
      setAnime(data.animes || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime(1, searchDebounced);
    setPage(1);
    // eslint-disable-next-line
  }, [searchDebounced]);

  useEffect(() => {
    fetchAnime(page, searchDebounced);
    // eslint-disable-next-line
  }, [page]);

  const handleAdd = () => {
    setModalMode('add');
    setEditAnime(null);
    setModalOpen(true);
  };

  const handleEdit = (anime: AnimeRow) => {
    setModalMode('edit');
    setEditAnime(anime);
    setModalOpen(true);
  };

  const handleModalSave = async (formData: any) => {
    setActionLoading(true);
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/admin/anime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to add anime');
      } else if (modalMode === 'edit' && editAnime) {
        const res = await fetch('/api/admin/anime', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ animeId: editAnime._id, ...formData }),
        });
        if (!res.ok) throw new Error('Failed to update anime');
      }
      setModalOpen(false);
      await fetchAnime();
    } catch (err: any) {
      alert(err.message || 'Failed to save anime');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (animeId: string) => {
    if (!window.confirm('Are you sure you want to delete this anime? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/anime', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete anime');
      }
      await fetchAnime();
    } catch (err: any) {
      alert(err.message || 'Failed to delete anime');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!hasPermission ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <p className="text-red-400 text-lg mb-2">Access Denied</p>
          <p className="text-slate-400">You do not have permission to access this page or the resource you requested.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Hentai Management
              </h1>
              <p className="text-slate-400 mt-2">Manage hentai titles, content, and metadata</p>
            </div>
            <button
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={handleAdd}
            >
              + Add Hentai
            </button>
          </div>


          {/* Search Bar */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search hentai by title, genre, or studio..."
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
          {/* Anime Table */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
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
                
                <div className="overflow-x-auto">
                  <table className="min-w-full text-white">
                    <thead>
                      <tr className="bg-slate-800/50">
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Poster</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Title</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Genres</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Media Type</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Status</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anime.map((a, idx) => (
                        <tr key={a._id} className="border-t border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 align-middle">
                            {a.poster ? (
                              <Image width={160} height={200} src={a.poster} alt={a.title || a.name} className="w-16 h-20 object-cover rounded-lg shadow-lg" />
                            ) : (
                              <div className="w-16 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                                <span className="text-slate-400 text-xs">No image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div>
                              <p className="font-medium text-white">{a.name}</p>
                              {a.year && <p className="text-sm text-slate-400">{a.year}</p>}
                              {a.alternativeTitles && a.alternativeTitles.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {a.alternativeTitles.slice(0, 3).map((alt, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                                      {alt}
                                    </span>
                                  ))}
                                  {a.alternativeTitles.length > 3 && (
                                    <span className="px-2 py-0.5 bg-slate-600 text-slate-400 text-xs rounded-full">
                                      +{a.alternativeTitles.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                              {typeof a.malid === 'number' && (
                                <div className="mt-2">
                                  <a
                                    href={`https://myanimelist.net/anime/${a.malid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full hover:bg-slate-600"
                                  >
                                    <span className="opacity-80">MAL:</span>
                                    <span className="font-mono">{a.malid}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex flex-wrap gap-1">
                              {a.genres?.slice(0, 3).map((g, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                                  {g.name}
                                </span>
                              ))}
                              {a.genres && a.genres.length > 3 && (
                                <span className="px-2 py-1 bg-slate-600 text-slate-400 text-xs rounded-full">
                                  +{a.genres.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                              {a.mediaType}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {(() => {
                              const status = (a.status || '').toLowerCase();
                              const styles: Record<string, string> = {
                                ongoing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                                upcoming: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                                finished: 'bg-green-500/20 text-green-300 border-green-500/30',
                                dropped: 'bg-red-500/20 text-red-300 border-red-500/30',
                                cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
                              };
                              const label = status ? status.replace('-', ' ') : 'unknown';
                              const klass = styles[status] || 'bg-slate-600/30 text-slate-300 border-slate-500/30';
                              return (
                                <span className={`px-3 py-1 text-sm rounded-full border ${klass}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex gap-2">
                              <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                onClick={() => window.open(`/hentai/${a._id}`, '_blank')}
                              >
                                <span>👁️</span>
                                View
                              </button>

                              <button
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                onClick={() => handleEdit(a)}
                              >
                                <span>✏️</span>
                                Edit
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                onClick={() => handleDelete(a._id)}
                                disabled={actionLoading}
                              >
                                <span>🗑️</span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4 p-6">
                  <div className="text-gray-400">
                    Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} anime
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-neutral-800 text-white border border-neutral-700 disabled:opacity-50"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-neutral-800 text-white border border-neutral-700 disabled:opacity-50"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
            <AnimeFormModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleModalSave}
              initialData={modalMode === 'edit' ? editAnime : undefined}
              mode={modalMode}
            />
            {actionLoading && (
              <div className="mt-4 text-purple-400">Processing...</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
