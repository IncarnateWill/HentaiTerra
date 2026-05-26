"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Types } from "mongoose";

interface Episode {
  _id?: string;
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

interface User {
  _id: string;
  clerkId: string;
  username: string;
  roles: string[];
}

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (episode: Episode) => Promise<void>;
  episode?: Episode | null;
  mode: 'add' | 'edit';
  animeId: string;
  loading?: boolean;
}

const emptyEpisode: Episode = {
  _id: '',
  name: "",
  displayTitle: "",
  episodeId: "",
  episodeNumber: 1,
  duration: "",
  thumbnail: "",
  videoUrl: "",
  videoUrlBackup: "",
  videoUrlBackup2: "",
  videoUrlBackup3: "",
  views: 0,
  releaseDate: new Date(),
  updateDate: new Date(),
  isCensored: false,
  likes: 0,
  dislikes: 0,
  verificator: "",
  encoder: "",
  traducator: "",
  genres: [],
};

export default function EpisodeFormModal({
  isOpen,
  onClose,
  onSubmit,
  episode,
  mode,
  animeId,
  loading = false
}: EpisodeFormModalProps) {
  const [form, setForm] = useState<Episode>(emptyEpisode);
  const [users, setUsers] = useState<User[]>([]);
  const [userOptions, setUserOptions] = useState<{
    verificator: User[];
    encoder: User[];
    traducator: User[];
  }>({ verificator: [], encoder: [], traducator: [] });
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'add') {
        setForm({ ...emptyEpisode });
      } else if (episode) {
        // Ensure all values are properly typed and sync name with displayTitle
        const episodeName = episode.name || episode.displayTitle || '';
        const sanitizedEpisode = {
          ...emptyEpisode,
          ...episode,
          name: episodeName,
          displayTitle: episode.displayTitle || episodeName,
          episodeId: episode.episodeId || '',
          episodeNumber: episode.episodeNumber || 1,
          duration: episode.duration || '',
          thumbnail: episode.thumbnail || '',
          videoUrl: episode.videoUrl || '',
          videoUrlBackup: episode.videoUrlBackup || '',
          videoUrlBackup2: episode.videoUrlBackup2 || '',
          videoUrlBackup3: episode.videoUrlBackup3 || '',
          verificator: episode.verificator || '',
          encoder: episode.encoder || '',
          traducator: episode.traducator || '',
          views: episode.views || 0,
          releaseDate: episode.releaseDate || new Date(),
          updateDate: episode.updateDate || new Date(),
          isCensored: episode.isCensored || false,
          likes: episode.likes || 0,
          dislikes: episode.dislikes || 0,
          genres: episode.genres || [],
        };
        setForm(sanitizedEpisode);
      }
      
      // Fetch users with relevant roles
      fetchUsers();
    }
  }, [isOpen, mode, episode]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users?limit=1000");
      if (res.ok) {
        const data = await res.json();
        const usersData = data.users || [];
        setUsers(usersData);
        setUserOptions({
          verificator: usersData.filter((u: User) => u.roles.includes("verificator")),
          encoder: usersData.filter((u: User) => u.roles.includes("encoder")),
          traducator: usersData.filter((u: User) => u.roles.includes("traducator")),
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      // Sync displayTitle with name field
      setForm(prev => ({ ...prev, [name]: value, displayTitle: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    setThumbnailUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload/thumbnail', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }
      setForm(prev => ({ ...prev, thumbnail: data.url }));
    } catch (err: any) {
      setThumbnailUploadError(err.message || 'Upload failed');
    } finally {
      setThumbnailUploading(false);
      // Reset file input so the same file can be re-uploaded if needed
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const handleClose = () => {
    if (!loading) {
      setForm(emptyEpisode);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
        <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-xl border border-slate-700/50 shadow-2xl min-w-[340px] max-w-full w-full sm:w-[800px] relative">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none transition-colors"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {mode === 'add' ? 'Add New Episode' : 'Edit Episode'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Episode Title *</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter episode title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Episode Number *</label>
                <input
                  type="number"
                  name="episodeNumber"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                  value={form.episodeNumber}
                  onChange={handleFormChange}
                  min={1}
                  required
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Duration</label>
                <input
                  type="text"
                  name="duration"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                  value={form.duration}
                  onChange={handleFormChange}
                  placeholder="e.g., 24:30"
                />
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Media URLs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Thumbnail</label>

                {/* Preview */}
                {form.thumbnail && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-slate-600 bg-slate-900 aspect-video w-full max-w-xs relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* URL input */}
                <input
                  type="text"
                  name="thumbnail"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors mb-2"
                  value={form.thumbnail}
                  onChange={handleFormChange}
                  placeholder="https://example.com/thumbnail.jpg or upload below"
                />

                {/* Upload button */}
                <div className="flex items-center gap-3">
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={thumbnailUploading || loading}
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={thumbnailUploading || loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {thumbnailUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        Uploading...
                      </>
                    ) : (
                      <>📁 Upload Image</>
                    )}
                  </button>
                  {form.thumbnail && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                      disabled={thumbnailUploading || loading}
                      className="px-3 py-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm transition-colors disabled:opacity-50"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {/* Upload error */}
                {thumbnailUploadError && (
                  <p className="text-red-400 text-xs mt-1">{thumbnailUploadError}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Primary Video URL *</label>
                <input
                  type="url"
                  name="videoUrl"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  value={form.videoUrl}
                  onChange={handleFormChange}
                  required
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Backup URL 1</label>
                  <input
                    type="url"
                    name="videoUrlBackup"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    value={form.videoUrlBackup}
                    onChange={handleFormChange}
                    placeholder="Backup video URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Backup URL 2</label>
                  <input
                    type="url"
                    name="videoUrlBackup2"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    value={form.videoUrlBackup2}
                    onChange={handleFormChange}
                    placeholder="Backup video URL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Backup URL 3</label>
                  <input
                    type="url"
                    name="videoUrlBackup3"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    value={form.videoUrlBackup3}
                    onChange={handleFormChange}
                    placeholder="Backup video URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-green-300">Team Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Verificator</label>
                <select
                  name="verificator"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors mb-2"
                  value={userOptions.verificator.some(u => u.username === form.verificator) ? form.verificator : ""}
                  onChange={handleFormChange}
                >
                  <option value="">Select verificator</option>
                  {userOptions.verificator.map(u => (
                    <option key={u.clerkId} value={u.username}>{u.username}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="verificator"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Or type a name..."
                  value={userOptions.verificator.some(u => u.username === form.verificator) ? "" : (form.verificator || "")}
                  onChange={handleFormChange}
                />
                {form.verificator && userOptions.verificator.some(u => u.username === form.verificator) && (
                  <Link 
                    href={`/profile/${form.verificator}`} 
                    className="text-blue-400 hover:underline text-sm mt-1 inline-block" 
                    target="_blank"
                  >
                    View Profile
                  </Link>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Encoder</label>
                <select
                  name="encoder"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors mb-2"
                  value={userOptions.encoder.some(u => u.username === form.encoder) ? form.encoder : ""}
                  onChange={handleFormChange}
                >
                  <option value="">Select encoder</option>
                  {userOptions.encoder.map(u => (
                    <option key={u.clerkId} value={u.username}>{u.username}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="encoder"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Or type a name..."
                  value={userOptions.encoder.some(u => u.username === form.encoder) ? "" : (form.encoder || "")}
                  onChange={handleFormChange}
                />
                {form.encoder && userOptions.encoder.some(u => u.username === form.encoder) && (
                  <Link 
                    href={`/profile/${form.encoder}`} 
                    className="text-blue-400 hover:underline text-sm mt-1 inline-block" 
                    target="_blank"
                  >
                    View Profile
                  </Link>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Traducator</label>
                <select
                  name="traducator"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors mb-2"
                  value={userOptions.traducator.some(u => u.username === form.traducator) ? form.traducator : ""}
                  onChange={handleFormChange}
                >
                  <option value="">Select traducator</option>
                  {userOptions.traducator.map(u => (
                    <option key={u.clerkId} value={u.username}>{u.username}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="traducator"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 focus:bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Or type a name..."
                  value={userOptions.traducator.some(u => u.username === form.traducator) ? "" : (form.traducator || "")}
                  onChange={handleFormChange}
                />
                {form.traducator && userOptions.traducator.some(u => u.username === form.traducator) && (
                  <Link 
                    href={`/profile/${form.traducator}`} 
                    className="text-blue-400 hover:underline text-sm mt-1 inline-block" 
                    target="_blank"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-700/50">
            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-neutral-700 text-white border border-neutral-600 hover:bg-neutral-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500 hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'add' ? 'Adding...' : 'Saving...'}
                </span>
              ) : (
                mode === 'add' ? 'Add Episode' : 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
