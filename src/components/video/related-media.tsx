// components/video/related-media.tsx
import HorizontalMediaCard from "@/components/ui/horizontal-media-card";

interface RelatedMediaProps {
    episodes: {
        episodeId: string;
        displayTitle: string;
        thumbnail: string;
        views: number;
        duration: string;
    }[];
}

const RelatedMedia = ({ episodes }: RelatedMediaProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold px-2">More Like This</h2>
            <div className="flex flex-col">
                {episodes.map((episode) => (
                    <HorizontalMediaCard
                        key={episode.episodeId}
                        id={episode.episodeId}
                        title={episode.displayTitle}
                        posterPath={episode.thumbnail}
                        views={episode.views}
                        duration={episode.duration}
                    />
                ))}
            </div>
        </div>
    );
};

export default RelatedMedia;