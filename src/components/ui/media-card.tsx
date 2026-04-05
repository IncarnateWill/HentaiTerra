import Image from 'next/image';
import Link from 'next/link';
import { HiPlay } from "react-icons/hi2";

interface MediaCardProps {
    id: string;
    title: string;
    posterPath: string;
    mediaType: "anime" | "3d";
    alt?: string;
    placeholder?: "blur" | "empty";
    status?: string; // Optional anime status badge
    censorship?: 'censored' | 'uncensored';
}

const MediaCard = ({ id, title, posterPath, mediaType, alt, placeholder, status, censorship }: MediaCardProps) => {
    const blurDataURL = placeholder === "blur" ? "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" : undefined;

    return (
        <Link
            href={`/watch/${id}`}
            className="group transition-transform duration-200 hover:-translate-y-1"
            aria-label={`Watch ${title || id}`}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800">
                {/* Status badge (anime only) - bottom left */}
                {mediaType === 'anime' && status && (
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
                {/* Censorship badge (anime only) - top left */}
                {mediaType === 'anime' && censorship && (
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
                        ${mediaType === '3d' ? 'bg-pink-600 text-white' : ''}`}
                >
                    {mediaType === 'anime' ? 'Hentai' : mediaType.toUpperCase()}
                </span>
                <Image
                    src={posterPath}
                    alt={title || alt || id}
                    title={title || alt || id}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="
                        (max-width: 480px) 90vw,
                        (max-width: 640px) 70vw,
                        (max-width: 1024px) 33vw,
                        25vw
                    "
                    quality={60}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                />
                {/* Hover overlay for play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <HiPlay className="w-14 h-14 text-white opacity-95" />
                    </div>
                </div>
            </div>
            <h4 className="mt-2 text-sm sm:text-base font-medium text-gray-200 break-words line-clamp-2">
                {title}
            </h4>
        </Link>
    );
};

export default MediaCard;