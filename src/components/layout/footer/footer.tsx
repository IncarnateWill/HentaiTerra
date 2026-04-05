import Link from "next/link";
import {
    HiHome,
    HiFilm,
    HiMail,
    HiInformationCircle,
    HiExclamationCircle,
    HiShieldCheck,
    HiUserGroup,
    HiHeart
} from "react-icons/hi";
import { FaDiscord, FaTwitter, FaInstagram, FaBook, FaTiktok, FaGhost } from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const navigation = [
        { name: "Acasă", href: "/home", icon: HiHome, ariaLabel: "Navighează la pagina principală" },
        { name: "Hentai", href: `/hentais`, icon: FaGhost, ariaLabel: "Răsfoiește colecția noastră de hentai"},
        { name: "Manga", href: process.env.NEXT_PUBLIC_MANGA_URL || "https://mangaterra.ro", icon: FaBook, ariaLabel: "Răsfoiește colecția noastră de manga", external: true },
        { name: "Watchlist", href: "/watchlist", icon: HiHeart, ariaLabel: "Vezi lista ta de urmărire" },
        { name: "Echipă", href: "/staff", icon: HiShieldCheck, ariaLabel: "Echipă" },
        { name: "Recrutare", href: "/recruit", icon: HiUserGroup, ariaLabel: "Recrutare" },
        { name: "Donează", href: "/donate", icon: HiHeart, ariaLabel: "Donează" },
        { name: "Anime", href: process.env.NEXT_PUBLIC_ANIME_URL || "https://animeterra.ro", icon: FaGhost, ariaLabel: "Răsfoiește colecția noastră de anime" },
    ];

    const legal = [
        { name: "Despre noi", href: "/about", icon: HiInformationCircle, ariaLabel: "Află mai multe despre HentaiTerra" },
        { name: "Contact", href: "/contact", icon: HiMail, ariaLabel: "Contactează HentaiTerra" },
        { name: "DMCA", href: "/dmca", icon: HiExclamationCircle, ariaLabel: "Raportează încălcarea drepturilor de autor" },
        { name: "Echipă", href: "/staff", icon: HiUserGroup, ariaLabel: "Cunoaște echipa" },
        { name: "Recrutare", href: "/recruit", icon: HiUserGroup, ariaLabel: "Hai în echipa noastră" },
        { name: "Donează", href: "/donate", icon: HiHeart, ariaLabel: "Susține HentaiTerra cu o donație" }
    ];

    const social = [
        { name: "Discord", href: "https://discord.gg/eAX557MEes", icon: FaDiscord, ariaLabel: "Alătură-te serverului nostru Discord" },
        { name: "Twitter", href: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/HentaiTerra", icon: FaTwitter, ariaLabel: "Urmărește-ne pe Twitter" },
        { name: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/hentaiterra/", icon: FaInstagram, ariaLabel: "Urmărește-ne pe Instagram" },
        { name: "TikTok", href: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/@hentaiterra.ro", icon: FaTiktok, ariaLabel: "Urmărește-ne pe TikTok" },
    ];

    return (
        <footer className="mt-auto bg-[#1a1625]/95 border-t border-purple-900/20 backdrop-blur-sm" role="contentinfo" aria-label="Subsol site">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* About */}
                    <section aria-label="Despre HentaiTerra" className="lg:col-span-2">
                        <h3 className="text-xl font-bold mb-4 text-purple-400">{process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            Bine ai venit la {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} - platforma ta preferată pentru hentai în România. 
                            Oferim o selecție vastă de conținut de înaltă calitate, actualizat regulat pentru publicul adult.
                        </p>
                        <div className="flex space-x-4">
                            {social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="text-gray-400 hover:text-purple-400 transition-colors"
                                    aria-label={`Vizitează ${item.name}ul nostru`}
                                >
                                    <item.icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                        <div className="mt-5">
                            <a
                                href="https://theporndude.com/ro"
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                aria-label="ThePornDude"
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-gray-200 border border-white/10 hover:bg-white/10 transition"
                            >
                                <span className="font-semibold">ThePornDude</span>
                            </a>
                        </div>
                    </section>

                    {/* Content */}
                    <nav aria-label="Navigare conținut" className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400">Conținut</h3>
                        <ul className="space-y-2">
                            {navigation.filter(item => ["Acasă", "Hentai", "Filme", "Watchlist"].includes(item.name)).map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                        aria-label={item.ariaLabel}
                                    >
                                        <item.icon className="w-4 h-4" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                            {navigation.filter(item => ["Manga"].includes(item.name)).map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                        aria-label={item.ariaLabel}
                                    >
                                        <item.icon className="w-4 h-4" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* Community */}
                    <nav aria-label="Linkuri comunitate" className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400">Comunitate</h3>
                        <ul className="space-y-2">
                            {legal.filter(item => ["Echipă", "Recrutare", "Donează"].includes(item.name)).map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        <item.icon className="w-4 h-4" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/SwvnaKc49N"}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                >
                                    <FaDiscord className="w-4 h-4" aria-hidden="true" />
                                    <span>Discord</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Legal */}
                    <nav aria-label="Linkuri legale" className="space-y-4">
                        <h3 className="text-lg font-semibold text-purple-400">Legal</h3>
                        <ul className="space-y-2">
                            {legal.filter(item => ["Despre noi", "Contact", "DMCA"].includes(item.name)).map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                        <item.icon className="w-4 h-4" aria-hidden="true" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Disclaimer and Copyright */}
                <div className="mt-12 pt-8 border-t border-purple-900/20">
                    <div className="text-sm text-gray-400 mb-4 max-w-3xl">
                        <p className="mb-2">
                            <strong className="text-purple-400">Disclaimer:</strong> {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} nu stochează niciun fișier pe serverele sale. 
                            Tot conținutul este furnizat de terțe părți neafiliate. Nu suntem responsabili pentru conținutul găzduit pe platformele terțe.
                        </p>
                        <p>
                            Toate mărcile comerciale, imaginile și conținutul video aparțin proprietarilor lor de drept. 
                        </p>
                        <p>
                            {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} respectă proprietatea intelectuală și drepturile de autor.
                        </p>
                    </div>
                    <div className="text-center text-gray-400">
                        <p>Copyright (C) 2026 IncarnateWill. Toate drepturile rezervate.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
