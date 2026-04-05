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
  const defaultPage = Math.floor(currentEpisodeIndex / pageSize) + 1;
  const [page, setPage] = useState(defaultPage);

  const totalPages = Math.ceil(episodes.length / pageSize);
  const paginatedEpisodes = episodes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <EpisodeList
        episodes={paginatedEpisodes.map(episode => ({
          ...episode,
          duration: episode.duration?.toString() || '0'
        }))}
        currentEpisodeId={currentEpisodeId}
      />
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 my-6">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${p === page ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md" : "bg-neutral-800 text-white hover:bg-neutral-700"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 