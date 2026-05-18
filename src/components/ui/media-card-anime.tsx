"use client";

import Image from 'next/image';
import Link from 'next/link';
import { HiPlay } from "react-icons/hi2";
import { useState } from 'react';
import { ImageSkeleton } from './Skeleton';

interface MediaCardProps {
  id: string;
  title: string;
  posterPath: string;
  mediaType: "anime" | "movie";
  name?: string;
  status?: string;
  censorship?: 'censored' | 'uncensored';
}

const statusColors: Record<string, string> = {
  ongoing: 'bg-emerald-500/90 text-white',
  upcoming: 'bg-amber-500/90 text-white',
  finished: 'bg-blue-500/90 text-white',
  dropped: 'bg-red-500/90 text-white',
  cancelled: 'bg-gray-500/90 text-white',
  'in-traducere': 'bg-violet-500/90 text-white',
};

const MediaCardAnime = ({ id, title, posterPath, mediaType, name, status, censorship }: MediaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const displayTitle = title || name || id;

  return (
    <Link
      href={`/hentai/${id}`}
      className="group block"
      aria-label={`Vizionează ${displayTitle}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#14161f] transition-all duration-300 group-hover:-translate-y-1">
        {/* Censorship badge */}
        {censorship && (
          <span className={`absolute top-2 left-2 z-20 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${censorship === 'uncensored' ? 'bg-emerald-500/85 text-white' : 'bg-red-500/85 text-white'}`}>
            {censorship === 'uncensored' ? 'Uncensored' : 'Censored'}
          </span>
        )}

        {/* Skeleton */}
        {!imageLoaded && !imageError && <ImageSkeleton className="absolute inset-0" />}

        {/* Image */}
        <Image
          src={posterPath}
          alt={displayTitle}
          title={displayTitle}
          fill
          loading="lazy"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
          quality={65}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-11 h-11 rounded-full bg-primary-500/90 flex items-center justify-center shadow-lg shadow-primary-500/40">
              <HiPlay className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          <div className="p-3 space-y-1">
            <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{displayTitle}</p>
            {status && (
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${statusColors[status.toLowerCase()] || 'bg-gray-500/90 text-white'}`}>
                {status.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Ring */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-primary-500/30 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Title */}
      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-300 group-hover:text-primary-300 line-clamp-2 transition-colors duration-200 leading-snug px-0.5">
        {displayTitle}
      </p>
    </Link>
  );
};

export default MediaCardAnime;
