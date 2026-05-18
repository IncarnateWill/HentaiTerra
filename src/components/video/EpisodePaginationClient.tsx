"use client";
import { useState } from "react";
import EpisodeList from "./episode-list";

export default function EpisodePaginationClient({
  episodes,
  currentEpisodeId,
  pageSize = 12,
}: {
  episodes: any[];
  currentEpisodeId: string;
  pageSize?: number;
}) {
  const currentEpisodeIndex = episodes.findIndex(ep => ep.episodeId === currentEpisodeId);
  const defaultPage = currentEpisodeIndex === -1 ? 1 : Math.floor(currentEpisodeIndex / pageSize) + 1;
  const [page, setPage] = useState(defaultPage);

  const totalPages = Math.ceil(episodes.length / pageSize);
  const paginatedEpisodes = episodes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <EpisodeList
          episodes={paginatedEpisodes.map(episode => ({
            ...episode,
            duration: episode.duration?.toString() || '0'
          }))}
          currentEpisodeId={currentEpisodeId}
        />
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 p-3 bg-white/5 border-t border-white/10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-bold transition-all duration-200 ${
                p === page 
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300 border border-white/5"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 