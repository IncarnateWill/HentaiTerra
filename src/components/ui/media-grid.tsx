import MediaCard from "./media-card";
import Link from "next/link";

interface Media {
  id: string;
  title: string;
  posterPath: string;
  mediaType: "anime" | "3d";
  views?: number;
  alt?: string;
  status?: string;
  censorship?: 'censored' | 'uncensored';
}

interface MediaGridProps {
  items: Media[];
  title?: string;
  viewAllHref?: string;
}

const MediaGrid = ({ items, title, viewAllHref }: MediaGridProps) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h3 className="section-accent text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h3>
          {viewAllHref && (
            <Link href={viewAllHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary-300 transition-colors px-3 py-1 rounded-full bg-white/5 hover:bg-primary-500/10 border border-white/8 hover:border-primary-500/30">
              Vezi toate <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            alt={item.title}
            posterPath={item.posterPath}
            mediaType={item.mediaType}
            status={item.status}
            censorship={item.censorship}
            layout="landscape"
          />
        ))}
      </div>
    </section>
  );
};

export default MediaGrid;