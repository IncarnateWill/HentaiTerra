"use client";
import EpisodePaginationClient from "./EpisodePaginationClient";

export default function EpisodePaginationWrapper({
  episodes,
  currentEpisodeId,
  pageSize,
}: {
  episodes: any[];
  currentEpisodeId: string;
  pageSize?: number;
}) {
  return (
    <EpisodePaginationClient
      episodes={episodes}
      currentEpisodeId={currentEpisodeId}
      pageSize={pageSize}
    />
  );
} 