
import { getPopularAnime } from '@/lib/db-utils';
import { getCachedData, setCachedData } from '@/lib/redis';
import { homeMetadata } from "@/config/rootmetadata";
import { getHomeStructuredData } from "@/config/rootstructured-data";
import Script from "next/script";
import SearchBoxHome from "@/components/shared/search-box-home";
import React, { Suspense } from "react";
import { RxDoubleArrowRight } from "react-icons/rx";
import Image from "next/image";
import ErrorBoundary from '@/components/ui/error-boundary';
import { HiShieldCheck, HiFilm, HiBolt, HiCalendar, HiDevicePhoneMobile, HiChatBubbleLeftRight } from "react-icons/hi2";

// Enable ISR for better performance
export const revalidate = 60; // 5 minutes
export const dynamic = 'force-static';

// Optimize metadata
export const metadata = {
  ...homeMetadata,
  alternates: {
    canonical: process.env.SITE_URL
  }
};


// Loading skeleton for popular anime section
const PopularAnimeSectionLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-dark-500 rounded w-64 mb-4"></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-dark-300 rounded-lg h-64"></div>
      ))}
    </div>
  </div>
);

// Error fallback for popular anime section
const PopularAnimeError = () => (
  <div className="text-center text-text-secondary py-4">
    <p className="text-semantic-error">Nu am putut încărca hentai-urile populare</p>
  </div>
);

// Separate component for popular anime links
const PopularAnimeLinks = async () => {
  const cacheKey = 'popular_anime_home';
  let popularAnime = await getCachedData<any[]>(cacheKey);

  if (!popularAnime) {
    popularAnime = await getPopularAnime(5); // Reduced from 20 to 5 for better performance
    await setCachedData(cacheKey, popularAnime, 3600); // Cache for 1 hour
  }
  
  return (
    <p className="text-sm sm:text-base text-text-secondary font-medium max-w-3xl overflow-hidden text-ellipsis whitespace-nowrap px-2">
      Căutări populare:{" "}
      {popularAnime.map((anime: { _id: string, name: string }, index: number) => (
        <React.Fragment key={anime._id}>
          <a href={`/hentai/${anime._id}`} className="hover:underline text-text-primary hover:text-primary-400 transition-colors">
            {anime.name}
          </a>
          {index < popularAnime.length - 1 && ", "}
        </React.Fragment>
      ))}
    </p>
  );
};

export default async function Home() {
  return (
    <>
      {/* Structured Data */}
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getHomeStructuredData())
        }}
        strategy="afterInteractive"
      />

      {/* Main Hero */}
      <main className="py-0">
        <div className="w-full flex flex-col">
          {/* Hero section — full bleed by counteracting layout padding */}
          <section className="relative overflow-hidden -mx-4 sm:-mx-6" style={{ minHeight: '520px' }}>
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/homebanner.webp"
                alt="HentaiTerra Background"
                fill
                className="object-cover object-center"
                priority
                quality={85}
                sizes="100vw"
              />
              {/* Multi-layer gradient for perfect text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060709]/97 via-[#060709]/80 to-[#060709]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/40 to-transparent" />
              {/* Subtle purple glow overlay */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)' }} />
            </div>

            {/* Animated particles / decorative orbs */}
            <div className="absolute top-12 right-[30%] w-72 h-72 rounded-full blur-[100px] opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
            <div className="absolute bottom-8 right-[10%] w-56 h-56 rounded-full blur-[80px] opacity-8" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20 py-20 sm:py-28 min-h-[520px]">
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-widest mb-5" style={{ backdropFilter: 'blur(8px)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  #1 Platforma Hentai în România
                </div>

                <h1 className="font-extrabold mb-4 leading-[1.1]" style={{ textShadow: '0 2px 40px rgba(0,0,0,0.8)' }}>
                  <span className="block text-5xl sm:text-6xl md:text-7xl text-white tracking-tight">
                    {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}
                  </span>
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-bold mt-2" style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #ec4899 60%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Hentai Online în Română
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-xl" style={{ textShadow: '0 1px 16px rgba(0,0,0,0.9)' }}>
                  Descoperă cea mai mare colecție de hentai subtitrat în română — streaming gratuit, HD, actualizat zilnic.
                </p>

                {/* Search */}
                <div className="w-full max-w-xl">
                  <SearchBoxHome />
                </div>

                {/* CTA row */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="/home"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-bold transition-all shadow-2xl hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
                  >
                    Vizionează acum
                    <RxDoubleArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/hentais"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/8 hover:bg-white/15 text-white text-sm font-bold border border-white/15 transition-all backdrop-blur-sm"
                  >
                    Browse All
                  </a>
                </div>

                {/* Popular searches */}
                <div className="mt-5">
                  <ErrorBoundary fallback={<PopularAnimeError />}>
                    <Suspense fallback={<PopularAnimeSectionLoader />}>
                      <PopularAnimeLinks />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            {/* Bottom fade into page */}
            <div className="absolute bottom-0 left-0 right-0 h-32 z-10" style={{ background: 'linear-gradient(to top, #060709 0%, transparent 100%)' }} />
          </section>
        </div>
      </main>

      {/* Features / Info Section */}
      <section className="relative mx-auto py-16 sm:py-24 px-4 max-w-8xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            De ce <span style={{ background: 'linear-gradient(90deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}</span>?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Platforma #1 de streaming hentai în română — gratuit, rapid, sigur și actualizat zilnic.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              icon: HiShieldCheck,
              color: 'from-emerald-500/20 to-emerald-500/5',
              border: 'border-emerald-500/20',
              iconColor: 'text-emerald-400',
              title: 'Siguranță Maximă',
              desc: 'Zero reclame periculoase, zero pop-up-uri. Platforma cea mai sigură de hentai din România.'
            },
            {
              icon: HiFilm,
              color: 'from-blue-500/20 to-blue-500/5',
              border: 'border-blue-500/20',
              iconColor: 'text-blue-400',
              title: 'Calitate Full HD',
              desc: '1080p, 720p sau 360p — alege calitatea potrivită conexiunii tale pentru o experiență cinematografică.'
            },
            {
              icon: HiBolt,
              color: 'from-amber-500/20 to-amber-500/5',
              border: 'border-amber-500/20',
              iconColor: 'text-amber-400',
              title: 'Streaming Ultra-Rapid',
              desc: 'Hentai-ul tău favorit pornește instant. Fără buffering, fără așteptări inutile.'
            },
            {
              icon: HiCalendar,
              color: 'from-pink-500/20 to-pink-500/5',
              border: 'border-pink-500/20',
              iconColor: 'text-pink-400',
              title: 'Actualizări Zilnice',
              desc: 'Noi episoade adăugate în fiecare zi. Fii primul care vizionează cele mai noi titluri.'
            },
            {
              icon: HiDevicePhoneMobile,
              color: 'from-violet-500/20 to-violet-500/5',
              border: 'border-violet-500/20',
              iconColor: 'text-violet-400',
              title: 'Funcționează Oriunde',
              desc: 'Telefon, tabletă sau PC — experiență optimizată pe toate dispozitivele tale.'
            },
            {
              icon: HiChatBubbleLeftRight,
              color: 'from-primary-500/20 to-primary-500/5',
              border: 'border-primary-500/20',
              iconColor: 'text-primary-400',
              title: 'Suport în Română',
              desc: 'Echipa noastră românească răspunde rapid. Link stricat sau hentai lipsă? Rezolvăm imediat!'
            },
          ].map(({ icon: Icon, color, border, iconColor, title, desc }) => (
            <div
              key={title}
              className={`relative group rounded-2xl border ${border} p-6 bg-gradient-to-br ${color} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
              style={{ background: 'rgba(13,14,20,0.7)' }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-gray-400 text-base mb-6">Hai să urmărim hentai împreună!</p>
          <a
            href="/home"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
          >
            Intră pe site
            <RxDoubleArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
