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
  status?: string;
  censorship?: 'censored' | 'uncensored';
  layout?: "portrait" | "landscape";
}

const statusColors: Record<string, string> = {
  ongoing: 'bg-emerald-500/90 text-white',
  upcoming: 'bg-amber-500/90 text-white',
  finished: 'bg-blue-500/90 text-white',
  dropped: 'bg-red-500/90 text-white',
  cancelled: 'bg-gray-500/90 text-white',
  'in-traducere': 'bg-violet-500/90 text-white',
};

const MediaCard = ({ id, title, posterPath, mediaType, alt, status, censorship, layout = "portrait" }: MediaCardProps) => {
  const isLandscape = layout === "landscape";

  return (
    <Link
      href={`/watch/${id}`}
      className="group block"
      aria-label={`Vizionează ${title || id}`}
    >
      {/* Poster container */}
      <div className={`media-card-poster relative overflow-hidden rounded-xl bg-[#14161f] transition-all duration-300 group-hover:-translate-y-1.5 ${isLandscape ? "aspect-video" : "aspect-[2/3]"}`}>
        {/* Censorship badge — top left */}
        {censorship && (
          <span className={`absolute top-2 left-2 z-20 badge text-[9px] px-1.5 py-0.5 rounded-md font-bold ${censorship === 'uncensored' ? 'bg-emerald-500/85 text-white' : 'bg-red-500/85 text-white'}`}>
            {censorship === 'uncensored' ? 'Uncensored' : 'Censored'}
          </span>
        )}

        {/* Poster image */}
        <Image
          src={posterPath}
          alt={title || alt || id}
          title={title || alt || id}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          sizes={isLandscape
            ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            : "(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
          }
          quality={65}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Play button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-primary-500/30 animate-ping opacity-0 group-hover:opacity-100" />
            <div className="relative w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-xl shadow-primary-500/50">
              <HiPlay className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {/* Title + status in overlay */}
          <div className="p-3 space-y-1">
            <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{title}</p>
            {status && (
              <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${statusColors[status.toLowerCase()] || 'bg-gray-500/90 text-white'}`}>
                {status.replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-primary-500/40 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Title below card — always visible */}
      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-400 group-hover:text-primary-300 line-clamp-2 transition-colors duration-200 leading-snug px-0.5">
        {title}
      </p>
    </Link>
  );
};

export default MediaCard;