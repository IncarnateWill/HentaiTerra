"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiPlay, HiChevronLeft, HiChevronRight, HiInformationCircle } from "react-icons/hi2";

interface AnimeSlide {
  id: string;
  title: string;
  posterPath: string;
  description?: string;
  genres?: { name: string }[];
  link?: string;
}

interface AnimeSliderProps {
  items: AnimeSlide[];
}

const AUTOPLAY_DURATION = 10000;

const AnimeSlider = ({ items }: AnimeSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const isPaused = useRef(false);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
    setProgressKey(k => k + 1);
  }, []);

  const next = useCallback(() => goTo((currentIndex + 1) % items.length), [currentIndex, items.length, goTo]);
  const prev = useCallback(() => goTo((currentIndex - 1 + items.length) % items.length), [currentIndex, items.length, goTo]);

  const startAutoplay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!isPaused.current) next();
    }, AUTOPLAY_DURATION);
  }, [next]);

  useEffect(() => {
    if (items.length > 1) startAutoplay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [items.length, startAutoplay]);

  const handleManual = (action: () => void) => {
    action();
    startAutoplay();
  };

  if (!items || items.length === 0) return null;
  const item = items[currentIndex];

  return (
    <div
      className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[520px] overflow-hidden rounded-2xl"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      {/* Background image — full bleed */}
      <div className="absolute inset-0 z-0">
        <Image
          key={item.id}
          src={item.posterPath}
          alt={item.title}
          fill
          className={`object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="100vw"
          quality={75}
          priority={currentIndex === 0}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
        {/* Skeleton while loading */}
        {!imageLoaded && <div className="absolute inset-0 shimmer bg-[#12141c]" />}
      </div>

      {/* Gradient masks */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a0b0f]/95 via-[#0a0b0f]/50 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0b0f]/90 via-transparent to-[#0a0b0f]/20" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pb-8 sm:pb-10 md:pb-12 px-6 sm:px-8 md:px-10">
        <div className="w-full max-w-xl">
          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.genres.slice(0, 4).map((g, i) => (
                <span key={i} className="badge bg-white/10 text-gray-300 border border-white/10 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg line-clamp-2">
            {item.title}
          </h2>

          {/* Description */}
          {item.description && (
            <p className="text-sm sm:text-base text-gray-300 line-clamp-2 mb-4 leading-relaxed max-w-lg">
              {item.description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href={item.link || `/hentai/${item.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 active:scale-95"
            >
              <HiPlay className="h-4 w-4" />
              Vizionează acum
            </Link>
            <Link
              href={item.link || `/hentai/${item.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/15 transition-all backdrop-blur-sm"
            >
              <HiInformationCircle className="h-4 w-4" />
              Mai multe
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators + arrows */}
      {items.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={() => handleManual(prev)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Slide anterior"
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleManual(next)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
            aria-label="Slide următor"
          >
            <HiChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-5 right-6 z-30 flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => handleManual(() => goTo(i))}
                className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-5 h-1.5 bg-primary-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/10">
            <div
              key={progressKey}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 origin-left"
              style={{ animation: `sliderProgress ${AUTOPLAY_DURATION}ms linear forwards` }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AnimeSlider;