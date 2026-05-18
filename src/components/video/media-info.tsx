// components/video/media-info.tsx
'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Add this import
import { HiCalendar, HiClock, HiChevronDown, HiChevronUp } from "react-icons/hi";

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
        traducator?: string;
        encoder?: string;
        verificator?: string;
        animeId?: string;
        status?: string;
        mediaType?: string;
        duration?: string;
        rating?: number | string;
        season?: string;
    };
}
const MediaInfo = ({ media }: MediaInfoProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="py-6">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Poster - Left Side on Large Screens */}
                <div className="flex-shrink-0 w-full md:w-[240px] mx-auto lg:mx-0">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                            src={media.posterPath || "/default-thumbnail.jpg"}
                            alt={media.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 240px"
                            priority
                        />
                    </div>
                </div>

                {/* Information - Right Side */}
                <div className="flex-grow space-y-6">
                    {/* Title and Genres */}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                            {media.animeId ? (
                                <Link href={`/hentai/${media.animeId}`} className="hover:text-primary-400 transition-colors">
                                    <h1 className="text-3xl font-bold text-white">{media.title}</h1>
                                </Link>
                            ) : (
                                <h1 className="text-3xl font-bold text-white">{media.title}</h1>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
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
                                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-gray-300 transition-colors"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>

                        {media.alternativeTitles && media.alternativeTitles.length > 0 && (
                            <p className="text-sm text-gray-400 font-medium">
                                {media.alternativeTitles.join(" • ")}
                            </p>
                        )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4 border-y border-white/5">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Format</span>
                            <p className="text-sm font-semibold text-gray-200 capitalize">{media.mediaType || 'TV'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                            <p className={`text-sm font-semibold capitalize ${
                                media.status === 'ongoing' ? 'text-blue-400' : 
                                media.status === 'finished' ? 'text-green-400' : 'text-gray-200'
                            }`}>
                                {media.status?.replace(/-/g, ' ') || 'Unknown'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Studio</span>
                            <p className="text-sm font-semibold text-gray-200">{media.creator}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Rating</span>
                            <p className="text-sm font-semibold text-gray-200">{media.rating || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Duration</span>
                            <p className="text-sm font-semibold text-gray-200">{media.duration || '24 min'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Season</span>
                            <p className="text-sm font-semibold text-gray-200 capitalize">{media.season || 'Unknown'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Start Date</span>
                            <p className="text-sm font-semibold text-gray-200">{media.releaseDate}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Censorship</span>
                            <p className={`text-sm font-semibold ${
                                media.censorship === "Censored" ? "text-red-400" : "text-green-400"
                            }`}>{media.censorship}</p>
                        </div>
                    </div>

                    {/* Synopsis */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Synopsis</h3>
                        <div className="relative">
                            <p className={`text-gray-300 leading-relaxed text-sm ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                {media.synopsis}
                            </p>
                            {media.synopsis.length > 200 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-2 transition-colors uppercase"
                                >
                                    {isExpanded ? (
                                        <>Read Less <HiChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>Read More <HiChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Staff Info */}
                    <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-xs">
                        <div className="flex gap-2">
                            <span className="text-gray-500">Traducator:</span>
                            <span className="text-gray-300 font-medium">{media.traducator}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500">Encoder:</span>
                            <span className="text-gray-300 font-medium">{media.encoder}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500">Verificator:</span>
                            <span className="text-gray-300 font-medium">{media.verificator}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaInfo;