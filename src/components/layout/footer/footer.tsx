"use client";
import Link from "next/link";
import { HiHome, HiFilm, HiMail, HiInformationCircle, HiExclamationCircle, HiShieldCheck, HiUserGroup, HiHeart, HiArrowUp } from "react-icons/hi";
import { FaDiscord, FaTwitter, FaInstagram, FaTiktok, FaGhost } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#070809] border-t border-white/4" role="contentinfo" aria-label="Subsol site">
      <div className="max-w-[1440px] mx-auto px-6 py-12 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-2 space-y-5">
            <div>
              <h3 className="text-lg font-extrabold mb-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Platforma ta preferată pentru hentai subtitrat în română. Conținut HD, actualizat zilnic, fără reclame intruzive.
              </p>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                { href: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/eAX557MEes", icon: FaDiscord, label: "Discord", hoverColor: 'hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10' },
                { href: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/HentaiTerra", icon: FaTwitter, label: "Twitter", hoverColor: 'hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10' },
                { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/HentaiTerra/", icon: FaInstagram, label: "Instagram", hoverColor: 'hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10' },
                { href: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/@HentaiTerra.ro", icon: FaTiktok, label: "TikTok", hoverColor: 'hover:text-white hover:border-white/30 hover:bg-white/10' },
              ].map(({ href, icon: Icon, label, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/4 border border-white/8 flex items-center justify-center text-gray-500 transition-all duration-200 ${hoverColor}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* ThePornDude */}
            <a
              href="https://theporndude.vip/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Best Porn Sites"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 text-xs text-gray-400 border border-white/6 hover:bg-white/8 hover:text-gray-200 transition-all"
            >
              Best Porn Sites
            </a>
          </div>

          {/* Conținut */}
          <nav aria-label="Conținut" className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 pb-1 border-b border-white/5">Conținut</h4>
            <ul className="space-y-2">
              {[
                { name: "Acasă", href: "/home", icon: HiHome },
                { name: "Hentai", href: "/hentais", icon: HiFilm },
                { name: "Watchlist", href: "/watchlist", icon: HiHeart },
                { name: "Anime", href: process.env.NEXT_PUBLIC_ANIME_URL || "https://anime-united.ro", icon: FaGhost, ext: true },
              ].map(({ name, href, icon: Icon, ext }) => (
                <li key={name}>
                  {ext ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-gray-700" />{name}
                    </a>
                  ) : (
                    <Link href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-gray-700" />{name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Comunitate */}
          <nav aria-label="Comunitate" className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 pb-1 border-b border-white/5">Comunitate</h4>
            <ul className="space-y-2">
              {[
                { name: "Echipă", href: "/staff", icon: HiShieldCheck },
                { name: "Recrutare", href: "/recruit", icon: HiUserGroup },
                { name: "Donează", href: "/donate", icon: HiHeart },
                { name: "Discord", href: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/SwvnaKc49N", icon: FaDiscord, ext: true },
              ].map(({ name, href, icon: Icon, ext }) => (
                <li key={name}>
                  {ext ? (
                    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-gray-700" />{name}
                    </a>
                  ) : (
                    <Link href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-gray-700" />{name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal" className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 pb-1 border-b border-white/5">Legal</h4>
            <ul className="space-y-2">
              {[
                { name: "Despre noi", href: "/about", icon: HiInformationCircle },
                { name: "Contact", href: "/contact", icon: HiMail },
                { name: "DMCA", href: "/dmca", icon: HiExclamationCircle },
              ].map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <Link href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-gray-700" />{name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid transparent', borderImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent) 1' }}>
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs text-gray-600 max-w-2xl">
              <span className="text-gray-500 font-medium">Disclaimer:</span> {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} nu stochează fișiere pe serverele sale. Conținutul este furnizat de terți. Toate mărcile aparțin proprietarilor lor.
            </p>
            <p className="text-xs text-gray-700">
              Copyright © {currentYear} IncarnateWill / {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Toate drepturile rezervate.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-300 bg-white/4 hover:bg-white/8 rounded-full border border-white/6 transition-all shrink-0"
            aria-label="Înapoi sus"
          >
            <HiArrowUp className="w-3.5 h-3.5" />
            Sus
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
