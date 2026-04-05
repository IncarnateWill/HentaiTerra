// components/ui/horizontal-media-card.tsx
import Image from "next/image";
import Link from "next/link";
import { HiEye, HiClock } from "react-icons/hi2";
import { memo } from "react";

interface HorizontalMediaCardProps {
    id: string;
    title: string;
    posterPath: string;
    views: number;
    duration?: string;
    className?: string;
}

const HorizontalMediaCard = memo(({
    id,
    title,
    posterPath,
    views,
    duration,
    className = ""
}: HorizontalMediaCardProps) => {
    // Format views (e.g., 1.5M, 300K, etc.)
    const formatViews = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const formatDuration = (duration: string) => {
        const durationLower = duration.trim().toLowerCase();
        let totalSeconds = 0;
    
        const timeMap = { h: 3600, m: 60 };
        Object.entries(timeMap).forEach(([unit, multiplier]) => {
            if (durationLower.includes(unit)) {
                const value = parseInt(durationLower.split(unit)[0], 10);
                totalSeconds += value * multiplier;
            }
        });
    
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        const padTime = (num: number) => num.toString().padStart(2, '0');
        
        if (hours > 0) return `${hours}:${padTime(minutes)}:${padTime(seconds)}`;
        if (minutes > 0) return `${minutes}:${padTime(seconds)}`;
        return padTime(seconds);
    };

    return (
        <Link
            href={`/watch/${id}`}
            className={`group flex gap-3 hover:bg-neutral-800/50 p-2 rounded-lg transition-all duration-200 hover:shadow-lg ${className}`}
        >
            {/* Poster/Thumbnail */}
            <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden shadow-md">
                <Image
                    src={posterPath}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 120px, 128px"
                    loading="lazy"
                    quality={85}
                />
                {duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                        <HiClock className="w-3 h-3" />
                        {formatDuration(duration)}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow min-w-0 py-1 justify-between">
                <h3 className="font-medium text-sm text-gray-100 line-clamp-2 leading-tight group-hover:text-white transition-colors duration-200">
                    {title}
                </h3>
                <div className="flex items-center gap-1 mt-auto text-gray-400 text-xs">
                    <HiEye className="w-4 h-4" />
                    <span>{formatViews(views)} views</span>
                </div>
            </div>
        </Link>
    );
});

HorizontalMediaCard.displayName = "HorizontalMediaCard";

export default HorizontalMediaCard;