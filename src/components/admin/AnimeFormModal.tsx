import React, { useState } from "react";
import { Film, Download, Save, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface AnimeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  mode: 'add' | 'edit';
}

const MEDIATYPE_OPTIONS = ["anime", "movie"];
const CENSORSHIP_OPTIONS = ["censored", "uncensored"] as const;
const STATUS_OPTIONS = ["ongoing", "finished", "upcoming", "dropped", "cancelled", "in-traducere"] as const;
const formatStatusLabel = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function mapExternalStatusToInternal(status?: string) {
  if (!status || typeof status !== 'string') return 'upcoming';
  const s = status.toLowerCase();
  if (s.includes('currently') || s.includes('airing') || s === 'ongoing') return 'ongoing';
  if (s.includes('finished') || s.includes('completed') || s === 'finished') return 'finished';
  if (s.includes('not yet') || s.includes('upcoming') || s.includes('planned') || s === 'upcoming') return 'upcoming';
  if (s.includes('dropped')) return 'dropped';
  if (s.includes('cancel')) return 'cancelled';
  return 'upcoming';
}

function normalizeFormData(data?: any) {
  console.log('normalizeFormData', data);
  return {
    name: data?.name ?? "",
    alternativeTitles: Array.isArray(data?.alternativeTitles) ? data.alternativeTitles.join(", ") : (data?.alternativeTitles ?? ""),
    description: data?.description ?? "",
    studio: data?.studio ?? "",
    poster: data?.poster ?? "",
    genres: Array.isArray(data?.genres)
      ? data.genres.map((g: any) => {
          if (typeof g === 'string') return g;
          if (g && g.name) return g.name;
          return '';
        }).filter(Boolean).join(", ")
      : (data?.genres ?? ""),
    mediaType: data?.mediaType ?? "anime",
    status: mapExternalStatusToInternal(data?.status),
    censorship: (typeof data?.censorship === 'string' ? data.censorship : 'censored'),
    // carry over MAL ID if present (supports both malId and malid keys)
    malId: (typeof data?.malId !== 'undefined' ? data.malId : (typeof data?.malid !== 'undefined' ? data.malid : "")),
  };
}

export default function AnimeFormModal({ open, onClose, onSave, initialData, mode }: AnimeFormModalProps) {
  const [malUrl, setMalUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(normalizeFormData(initialData));
  const [showImport, setShowImport] = useState(!initialData);

  React.useEffect(() => {
    if (open) {
      setForm(normalizeFormData(initialData));
      setMalUrl("");
      setError(null);
      setShowImport(!initialData);
    }
  }, [open, initialData]);

  // Improved MAL ID extraction
  function extractMalId(url: string): number | null {
    try {
      const cleanUrl = url.trim();
      // Accepts: /anime/12345, /anime/12345/, /anime/12345/Title, etc.
      const match = cleanUrl.match(/myanimelist\.net\/anime\/(\d+)/i);
      if (match && match[1]) return parseInt(match[1], 10);
      // Accept just the ID
      if (/^\d+$/.test(cleanUrl)) return parseInt(cleanUrl, 10);
    } catch {}
    return null;
  }

  // Import from MAL by URL with retry logic
  const handleImport = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // Progressive delay: 1s, 2s, 3s
    
    setImporting(true);
    setError(null);
    const malId = extractMalId(malUrl);
    if (!malId) {
      setError("Invalid MyAnimeList URL or ID");
      setImporting(false);
      return;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const res = await fetch("/api/admin/anime/fetch-myanimelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ malId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API request failed (${res.status}): ${errorText}`);
      }
      const data = await res.json();
      if (data.anime) {
        console.log('data.anime', data.anime);
        
        // Validate required fields
        const validationErrors = [];
        if (!data.anime.title || data.anime.title.trim() === '') {
          validationErrors.push('Title is missing');
        }
        if (!data.anime.synopsis || data.anime.synopsis.trim() === '') {
          validationErrors.push('Synopsis is missing');
        }
        if (!data.anime.poster) {
          validationErrors.push('Poster image is missing');
        }
        if (!data.anime.genres || !Array.isArray(data.anime.genres) || data.anime.genres.length === 0) {
          validationErrors.push('Genres are missing');
        }
        
        if (validationErrors.length > 0) {
          setError(`Import validation failed: ${validationErrors.join(', ')}. Please check the MAL entry or add missing data manually.`);
          setImporting(false);
          return;
        }
        
        // Use alternative titles provided by the API response when available
        const romajiTitle = data.anime.title?.trim?.() ? data.anime.title.trim() : data.anime.title; // MAL 'title' (romaji)
        const alternatives = Array.isArray(data.anime.alternativeTitles)
          ? data.anime.alternativeTitles
          : [];
        
        // If no alternative titles are present from the API, just proceed without them
        if (!Array.isArray(data.anime.alternativeTitles) || alternatives.length === 0) {
          console.warn('No alternative titles provided by API response');
        }
        
        setForm(normalizeFormData({
          name: romajiTitle,
          alternativeTitles: alternatives,
          description: data.anime.synopsis,
          studio: (data.anime.studios && data.anime.studios[0]?.name) || "",
          poster: data.anime.poster,
          genres: (data.anime.genres || []).map((g: any) => g.name).join(", "),
          mediaType: "anime",
          malId: data.anime.malId,
          censorship: (data.anime.suggestedCensorship === 'uncensored' ? 'uncensored' : 'censored'),
        }));
        setShowImport(false);
      } else {
        setError("Failed to import anime data - no anime data received from API");
      }
    } catch (err: any) {
      console.error('MAL import error:', err);
      
      // Handle different error types
      if (err.name === 'AbortError') {
        if (retryCount < maxRetries) {
          console.log(`Request timeout, retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => handleImport(retryCount + 1), retryDelay);
          return;
        } else {
          setError('Request timed out after multiple attempts. Please try again later.');
        }
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        if (retryCount < maxRetries) {
          console.log(`Network error, retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => handleImport(retryCount + 1), retryDelay);
          return;
        } else {
          setError('Network error after multiple attempts. Please check your connection and try again.');
        }
      } else if (err.message?.includes('500') || err.message?.includes('502') || err.message?.includes('503')) {
        if (retryCount < maxRetries) {
          console.log(`Server error, retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => handleImport(retryCount + 1), retryDelay);
          return;
        } else {
          setError('Server error after multiple attempts. The MAL API might be temporarily unavailable.');
        }
      } else {
        setError(err.message || "Failed to import anime data");
      }
    } finally {
      setImporting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev: Record<string, string>) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      ...form,
      alternativeTitles: form.alternativeTitles ? form.alternativeTitles.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      genres: form.genres ? form.genres.split(",").map((g: string) => g.trim()).filter(Boolean) : [],
      status: form.status,
      // ensure malId is sent as a number when present
      ...(form.malId ? { malId: parseInt(form.malId, 10) } : {}),
    };
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'add' ? 'Add New Hentai' : 'Edit Hentai'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {mode === 'add' ? 'Create a new hentai entry' : 'Update existing hentai information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Import Section */}
          {showImport && (
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Import from MyAnimeList</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Enter a MyAnimeList URL or ID to automatically import hentai information
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={malUrl}
                  onChange={e => setMalUrl(e.target.value)}
                  placeholder="https://myanimelist.net/anime/12345/Title or 12345"
                  disabled={importing}
                />
                <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl border border-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                  onClick={() => handleImport()}
                  disabled={!malUrl || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Manual Form */}
          {(!showImport || form.name || form.description || form.poster) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={form.name ?? ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter hentai title"
                />
              </div>

              {/* MyAnimeList ID */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">MyAnimeList ID</label>
                <input
                  type="text"
                  name="malId"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={form.malId ?? ""}
                  onChange={handleChange}
                  placeholder="e.g., 12345"
                />
                <p className="text-xs text-slate-500 mt-1">If imported, this is filled automatically.</p>
              </div>

              {/* Alternative Titles */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Alternative Titles</label>
                <input
                  type="text"
                  name="alternativeTitles"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={form.alternativeTitles ?? ""}
                  onChange={handleChange}
                  placeholder="English, Japanese, Romanian titles (comma separated)"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple titles with commas</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-vertical"
                  value={form.description ?? ""}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Enter anime description/synopsis"
                />
              </div>

              {/* Genres and Studio Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Genres</label>
                  <input
                    type="text"
                    name="genres"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    value={form.genres ?? ""}
                    onChange={handleChange}
                    placeholder="Action, Adventure, Fantasy"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Studio</label>
                  <input
                    type="text"
                    name="studio"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    value={form.studio ?? ""}
                    onChange={handleChange}
                    placeholder="Studio name"
                  />
                </div>
              </div>

              {/* Poster URL and Media Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Poster URL</label>
                  <input
                    type="text"
                    name="poster"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    value={form.poster ?? ""}
                    onChange={handleChange}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Media Type</label>
                  <select
                    name="mediaType"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    value={form.mediaType ?? "anime"}
                    onChange={handleChange}
                  >
                    {MEDIATYPE_OPTIONS.map(t => (
                      <option key={t} value={t} className="bg-slate-800 text-white">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  name="status"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={form.status ?? "upcoming"}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} className="bg-slate-800 text-white">
                      {formatStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Censorship */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Censorship</label>
                <select
                  name="censorship"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  value={form.censorship ?? "censored"}
                  onChange={handleChange}
                >
                  {CENSORSHIP_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-slate-800 text-white">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Default from MAL import or set manually.</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border border-slate-600 transition-colors duration-200"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl border border-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {mode === 'add' ? 'Add Hentai' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Toggle Import/Manual */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowImport(!showImport)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {showImport ? 'Switch to manual entry' : 'Import from MyAnimeList'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
