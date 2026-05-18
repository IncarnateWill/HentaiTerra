// components/video/episode-list.tsx
import Image from "next/image";
import Link from "next/link";


interface Episode {
    episodeId: string;
    episodeNumber: number;
    thumbnail: string;
    name?: string;
    duration: string;
    releaseDate?: string;
}

interface EpisodeListProps {
    episodes: Episode[];
    currentEpisodeId: string;
    name?: string;
}

const formatDuration = (duration: string) => {
    const durationLower = duration.trim().toLowerCase();
    let totalSeconds = 0;

    if (durationLower.includes('h')) {
        const hours = parseInt(durationLower.split('h')[0], 10);
        totalSeconds += hours * 3600;
    }
    if (durationLower.includes('m')) {
        const minutes = parseInt(durationLower.split('m')[0], 10);
        totalSeconds += minutes * 60;
    }

    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `0:${seconds.toString().padStart(2, '0')}`;
    }
};

const EpisodeList = ({ episodes, currentEpisodeId }: EpisodeListProps) => {
    return (
        <div className="flex flex-col h-full bg-[#121212]">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 bg-white/10 px-2 py-1 rounded">
                        {episodes.length} - {episodes.length}
                    </span>
                    <div className="relative group">
                        <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Filter episodes..." 
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs text-gray-300 focus:outline-none focus:border-primary-500/50 w-48 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="p-2 space-y-1">
                    {episodes.map((episode) => {
                        const isActive = episode.episodeId === currentEpisodeId;
                        return (
                            <Link
                                key={episode.episodeId}
                                href={`/watch/${episode.episodeId}`}
                                className={`group flex gap-3 p-2 rounded-lg transition-all duration-200 ${
                                    isActive 
                                    ? "bg-primary-500/20 ring-1 ring-primary-500/30" 
                                    : "hover:bg-white/5"
                                }`}
                            >
                                <div className="relative w-28 aspect-video flex-shrink-0 rounded overflow-hidden">
                                    <Image
                                        src={episode.thumbnail || "/default-thumbnail.jpg"}
                                        alt={`Episode ${episode.episodeNumber}`}
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                    />
                                    <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[8px] font-bold text-white border border-white/10 uppercase">
                                        EP {episode.episodeNumber}
                                    </div>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center min-w-0 flex-grow">
                                    <h3 className={`text-[11px] font-bold truncate leading-tight mb-0.5 ${isActive ? 'text-primary-400' : 'text-gray-200 group-hover:text-white'}`}>
                                        Episode {episode.episodeNumber}
                                    </h3>
                                    <div className="flex items-center justify-end mt-auto">
                                        {episode.releaseDate && (
                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">
                                                {new Date(episode.releaseDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


export default EpisodeList;