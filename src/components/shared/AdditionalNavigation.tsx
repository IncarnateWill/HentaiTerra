import Link from 'next/link';
import {
  HiHome,
  HiFilm,
  HiSearch,
  HiBookmark,
  HiInformationCircle,
  HiMail,
  HiHeart
} from 'react-icons/hi';

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface AdditionalNavigationProps {
  title: string;
  links: NavigationLink[];
  className?: string;
}

export default function AdditionalNavigation({ title, links, className = '' }: AdditionalNavigationProps) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-purple-700/20 shadow-lg p-4 md:p-6 w-full ${className}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, index) => {
          const IconComponent = link.icon;
          return (
            <Link
              key={index}
              href={link.href}
              className="group flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 hover:from-purple-700/30 hover:to-blue-700/30 border border-purple-700/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <IconComponent className="h-6 w-6 text-purple-400 group-hover:text-purple-300 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-white group-hover:text-purple-100 transition-colors">
                  {link.label}
                </span>
                {link.description && (
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 mt-1">
                    {link.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Predefined navigation links for different contexts
export const mainNavigationLinks: NavigationLink[] = [
  {
    href: '/',
    label: 'Acasă',
    icon: HiHome,
    description: 'Pagina principală'
  },
  {
    href: '/hentais',
    label: 'Toate Hentai-urile',
    icon: HiFilm,
    description: 'Explorează colecția completă'
  },
  {
    href: '/watchlist',
    label: 'Lista Mea',
    icon: HiBookmark,
    description: 'Hentai-urile tale salvate'
  },
  {
    href: '/about',
    label: 'Despre Noi',
    icon: HiInformationCircle,
    description: 'Află mai multe despre site'
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: HiMail,
    description: 'Ia legătura cu echipa'
  }
];

export const supportNavigationLinks: NavigationLink[] = [
  {
    href: '/donate',
    label: 'Susține Proiectul',
    icon: HiHeart,
    description: 'Ajută-ne să continuăm'
  },
  {
    href: '/contact',
    label: 'Raportează o Problemă',
    icon: HiMail,
    description: 'Semnalează bug-uri sau probleme'
  },
  {
    href: '/about',
    label: 'Cum Funcționează',
    icon: HiInformationCircle,
    description: 'Ghid de utilizare'
  }
];

export const quickAccessLinks: NavigationLink[] = [
  {
    href: '/hentais?sort=latest',
    label: 'Ultimele Adăugate',
    icon: HiFilm,
    description: 'Cele mai noi hentai-uri'
  },
  {
    href: '/hentais?sort=popular',
    label: 'Populare',
    icon: HiFilm,
    description: 'Cele mai vizionate hentai-uri'
  }
];