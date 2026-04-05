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
    name?: string; // Optional name prop
    status?: string; // Optional status badge
    censorship?: 'censored' | 'uncensored';
}

const MediaCardAnime = ({ id, title, posterPath, mediaType, name, status, censorship }: MediaCardProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <Link
            href={`/hentai/${id}`}
            className="group transition-transform duration-200 hover:-translate-y-1"
            aria-label={`Watch ${title || name || id}`}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800">
                {/* Status badge - bottom left */}
                {status && (
                    <span className={`absolute bottom-2 left-2 z-10 px-2 py-1 text-[10px] sm:text-xs rounded-md font-semibold shadow capitalize
                        ${(() => {
                            const s = status.toLowerCase();
                            const styles: Record<string, string> = {
                                ongoing: 'bg-purple-600 text-white',
                                upcoming: 'bg-yellow-600 text-white',
                                finished: 'bg-green-600 text-white',
                                dropped: 'bg-red-600 text-white',
                                cancelled: 'bg-gray-600 text-white',
                                'in-traducere': 'bg-indigo-600 text-white',
                            };
                            return styles[s] || 'bg-slate-600 text-white';
                        })()}
                    `}>
                        {(status || '').replace(/-/g, ' ')}
                    </span>
                )}
                {/* Censorship badge - top left */}
                {censorship && (
                    <span className={`absolute top-2 left-2 z-10 px-2 py-1 text-[10px] sm:text-xs rounded-md font-semibold shadow
                        ${censorship === 'uncensored' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                        {censorship}
                    </span>
                )}
                {/* Media type badge */}
                <span
                    className={`absolute top-2 right-2 z-10 px-2 py-1 text-[10px] sm:text-xs rounded-md font-semibold shadow
                        ${mediaType === 'anime' ? 'bg-blue-600 text-white' : ''}
                        ${mediaType === 'movie' ? 'bg-indigo-600 text-white' : ''}`}
                >
                    {mediaType === 'anime' ? 'Hentai' : 'Movie'}
                </span>
                {/* Skeleton loader */}
                {!imageLoaded && !imageError && (
                    <ImageSkeleton className="absolute inset-0" />
                )}
                
                {/* Image */}
                <Image
                    src={posterPath}
                    alt={title || name || id}
                    title={title || name || id}
                    fill
                    loading="lazy"
                    className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="
                        (max-width: 480px) 90vw,
                        (max-width: 640px) 70vw,
                        (max-width: 1024px) 33vw,
                        25vw
                    "
                    quality={70}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
                
                {/* Hover overlay for play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <HiPlay className="w-14 h-14 text-white opacity-95" />
                    </div>
                </div>
            </div>
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-200 break-words line-clamp-2">
                {title || name || id}
            </h3>
        </Link>
    );
};

export default MediaCardAnime;
