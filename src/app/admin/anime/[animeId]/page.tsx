"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function AdminAnimeDetailPage() {
  const router = useRouter();
  const { animeId } = useParams() as { animeId: string };
  const [anime, setAnime] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!animeId) return;
    setLoading(true);
    fetch(`/api/admin/anime?animeId=${animeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.animes && data.animes.length > 0) {
          setAnime(data.animes[0]);
        } else {
          setError("Hentai not found");
        }
      })
      .catch(() => setError("Failed to fetch hentai"))
      .finally(() => setLoading(false));
  }, [animeId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!anime) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{anime.name}</h1>
      <div className="flex gap-4 mb-4">
        {anime.poster && <Image src={anime.poster} alt={anime.name} width={128} height={176} className="w-32 h-44 object-cover rounded" />}
        <div>
          <div className="mb-2"><b>Genres:</b> {anime.genres?.map((g: any) => g.name).join(", ")}</div>
          <div className="mb-2"><b>Studio:</b> {anime.studio}</div>
          <div className="mb-2"><b>Media Type:</b> {anime.mediaType}</div>
          <div className="mb-2"><b>Status:</b> {anime.status}</div>
        </div>
      </div>
      <div className="mb-4"><b>Description:</b> <br />{anime.description}</div>
      <button
        className="px-4 py-2 rounded bg-purple-600 text-white border border-purple-700 hover:bg-purple-700"
        onClick={() => router.push(`/admin/anime/${animeId}/episodes`)}
      >
        Manage Episodes
      </button>
    </div>
  );
}
