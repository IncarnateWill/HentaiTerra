// components/video/media-info.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import { HiCalendar, HiClock, HiChevronDown, HiChevronUp } from "react-icons/hi";
import Link from "next/link";

interface MediaInfoProps {
    media: {
        title: string;
        alternativeTitles?: string[];
        synopsis: string;
        posterPath: string;
        genres: { name: string; _id: string }[];
        creator: string;
        releaseDate: string;
        uploadDate: string;
        censorship: "Censored" | "Uncensored";
        status?: string;
    };
}

const MediaInfo = ({ media }: MediaInfoProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="py-8">
            {/* Title Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{media.title}</h1>
                    {media.status && (
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wide
                                ${media.status === 'ongoing' ? 'bg-blue-500/20 text-blue-300' : ''}
                                ${media.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                                ${media.status === 'finished' ? 'bg-green-500/20 text-green-300' : ''}
                                ${media.status === 'dropped' ? 'bg-red-500/20 text-red-300' : ''}
                                ${media.status === 'cancelled' ? 'bg-gray-500/20 text-gray-300' : ''}
                                ${media.status === 'in-traducere' ? 'bg-indigo-500/20 text-indigo-300' : ''}
                            `}
                        >
                            {media.status.replace(/-/g, ' ')}
                        </span>
                    )}
                </div>
                {media.alternativeTitles && media.alternativeTitles.length > 0 && (
                    <h2 className="mt-1 text-sm text-gray-400">
                        {media.alternativeTitles.join(" • ")}
                    </h2>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-full hidden md:block md:w-[200px]">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <Image
                    src={media.posterPath || "/default-thumbnail.jpg"}
                    alt={media.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                    priority
                />
                    </div>
                </div>

                {/* Information */}
                <div className="flex-grow space-y-5">
                    {/* Synopsis */}
                    <div>
                        <h2 className="text-gray-400 text-sm mb-1">Descriere</h2>
                        <div className="relative">
                            <p className={`text-gray-200 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''
                                }`}>
                                {media.synopsis}
                            </p>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mt-1 transition-colors"
                            >
                                {isExpanded ? (
                                    <>
                                        Arata mai putin <HiChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Arata mai mult <HiChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {/* Creator */}
                        <div className="flex items-center gap-2">
                            <div>
                                <h3 className="text-gray-400 text-sm">Creator</h3>
                                <h4 className="text-gray-200">{media.creator}</h4>
                            </div>
                        </div>

                        {/* Release Date */}
                        <div className="flex items-center gap-2">
                            <HiCalendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <h3 className="text-gray-400 text-sm">Data lansării</h3>
                                <h4 className="text-gray-200">{media.releaseDate}</h4>
                            </div>
                        </div>

                        {/* Upload Date */}
                        <div className="flex items-center gap-2">
                            <HiClock className="w-5 h-5 text-gray-400" />
                            <div>
                                <h3 className="text-gray-400 text-sm">Data postării</h3>
                                <h4 className="text-gray-200">{media.uploadDate}</h4>
                            </div>
                        </div>

                        {/* Censorship */}
                        <div className="flex items-center gap-2">
                            <div>
                                    <h3 className="text-gray-400 text-sm">Censorship</h3>
                                <h4
                                    className={`inline-block px-3 py-1 rounded-full text-sm ${media.censorship === "Censored"
                                            ? "bg-red-500/20 text-red-400"
                                            : "bg-green-500/20 text-green-400"
                                        }`}
                                >
                                    {media.censorship}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Genres */}
                    <div>
                        <h2 className="text-gray-400 text-sm mb-2">Genuri</h2>
                        <div className="flex flex-wrap gap-2">
                            {media.genres.map((genre) => (
                                <Link

                                    key={genre._id}
                                    href="/hentais"
                                    onClick={() => {
                                        sessionStorage.setItem('animeFilters', JSON.stringify({
                                            genres: [genre._id],
                                            sort: 'latest',
                                            search: ''
                                        }));
                                    }}
                                    className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition-colors"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaInfo;