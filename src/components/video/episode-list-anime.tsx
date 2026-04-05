// components/video/episode-list.tsx
import Image from "next/image";
import Link from "next/link";


interface Episode {
    episodeId: string;
    episodeNumber: number;
    thumbnail: string;
    name?: string;
    duration: string;
    _id: string;
}


interface EpisodeListProps {
    episodes: Episode[];
    currentEpisodeId: string;
    name?: string;
}

const formatDuration = (duration: string) => {
    // Remove any spaces and handle 'm' (minutes) and 'h' (hours)
    const durationLower = duration.trim().toLowerCase();
    
    let totalSeconds = 0;

    // Parse 'h' (hours)
    if (durationLower.includes('h')) {
        const hours = parseInt(durationLower.split('h')[0], 10);
        totalSeconds += hours * 3600; // Convert hours to seconds
    }

    // Parse 'm' (minutes)
    if (durationLower.includes('m')) {
        const minutes = parseInt(durationLower.split('m')[0], 10);
        totalSeconds += minutes * 60; // Convert minutes to seconds
    }

    // Now we have the total time in seconds, we can format it
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // Format HH:MM:SS
    } else if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`; // Format MM:SS
    } else {
        return `${seconds.toString().padStart(2, '0')}`; // Format SS
    }
};

const AnimeEpisodeList = ({ episodes, currentEpisodeId }: EpisodeListProps) => {

    return (
        <div className="mt-6 mb-8">
            {/* <h2 className="text-xl font-bold mb-4">Episoade</h2> */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {episodes.map((episode) => (
                    
                    <Link
                        key={episode.episodeId}
                        href={`/watch/${episode.episodeId}`}
                        className={`group relative aspect-video rounded-lg overflow-hidden ${episode.episodeId === currentEpisodeId
                            ? "ring-2 ring-white"
                            : "hover:ring-2 hover:ring-gray-500"
                            }`}
                    >
                        <Image
                    src={episode.thumbnail || "/default-thumbnail.jpg"}
                    alt={`Episodul ${episode.episodeNumber}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-medium">
                                Episodul {episode.episodeNumber}
                                {/* {episode.name && `: \n${episode.name}`} */}
                            </span>
                        </div>
                        {episode.duration && (
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white">
                                {formatDuration(episode.duration)}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};


export default AnimeEpisodeList;