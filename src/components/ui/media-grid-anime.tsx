import MediaCardAnime from "./media-card-anime";
import Link from "next/link";

interface Media {
  id: string;
  title: string;
  posterPath: string;
  mediaType: "anime" | "movie";
  name?: string;
  status?: string;
  censorship?: 'censored' | 'uncensored';
}

interface MediaGridProps {
  items: Media[];
  title?: string;
  viewAllHref?: string;
}

const MediaGridAnime = ({ items, title, viewAllHref }: MediaGridProps) => {
  if (!items || items.length === 0) return null;
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="section-accent text-lg sm:text-xl font-bold text-white">
            {title}
          </h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
              Vezi toate <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {items.map((item) => (
          <MediaCardAnime
            key={item.id}
            id={item.id}
            title={item.title}
            posterPath={item.posterPath}
            mediaType={item.mediaType}
            name={item.name}
            status={item.status}
            censorship={item.censorship}
          />
        ))}
      </div>
    </section>
  );
};

export default MediaGridAnime;