"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HiPlay, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { ImageSkeleton } from './Skeleton';

// Simple fade transition without framer-motion to reduce bundle size
const SimpleTransition = ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => (
    <div className={`absolute inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {children}
    </div>
);

interface AnimeSlide {
    id: string;
    title: string;
    posterPath: string;
    description?: string;
    genres?: { name: string }[];
}

interface AnimeSliderProps {
    items: AnimeSlide[];
}

const AnimeSlider = ({ items }: AnimeSliderProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    
    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setImageLoaded(false);
        setImageError(false);
    }, [items.length]);
    
    const prevSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
        setImageLoaded(false);
        setImageError(false);
    }, [items.length]);
    
    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setImageLoaded(false);
        setImageError(false);
    }, []);
    
    // Reset autoplay timer when manually changing slides
    const handleManualNavigation = useCallback((action: () => void) => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
        
        action();
        
        if (isAutoPlaying) {
            autoPlayRef.current = setInterval(nextSlide, 20000);
        }
    }, [isAutoPlaying, nextSlide]);
    
    // Setup and cleanup autoplay
    useEffect(() => {
        if (isAutoPlaying && items.length > 1) {
            autoPlayRef.current = setInterval(nextSlide, 10000);
        }
        
        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        };
    }, [isAutoPlaying, items.length, nextSlide]);
    
    // Pause autoplay when user interacts with slider
    const handleMouseEnter = useCallback(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    }, []);
    
    const handleMouseLeave = useCallback(() => {
        if (isAutoPlaying && !autoPlayRef.current && items.length > 1) {
            autoPlayRef.current = setInterval(nextSlide, 10000);
        }
    }, [isAutoPlaying, items.length, nextSlide]);
    
    if (!items || items.length === 0) {
        return null;
    }
    
    const currentItem = items[currentIndex];
    
    return (
        <div 
            className="relative w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] mb-6 sm:mb-10 rounded-xl overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
        >
            {/* Main Slide */}
            <SimpleTransition isVisible={true}>
                    <div className="relative w-full h-full bg-[#13111C]/80 backdrop-blur-sm">
                        {/* Skeleton loader for background image */}
                        {!imageLoaded && !imageError && (
                            <ImageSkeleton className="absolute inset-0 opacity-30" />
                        )}
                        
                        {/* Optimized Background Image */}
                        <div className={`absolute inset-0 z-0 ${imageLoaded ? 'opacity-30' : 'opacity-0'} transition-opacity duration-300`}>
                            <Image
                                src={currentItem.posterPath}
                                alt={currentItem.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                                className="object-cover"
                                quality={50}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                                loading='lazy'
                            />
                        </div>
                        
                        {/* Content Container */}
                        <div className="absolute inset-0 z-10">
                            <div className="container h-full mx-auto px-4 md:px-6 lg:px-8 flex items-center">
                                <div className="w-full h-full flex flex-col md:flex-row">
                                    {/* Left Side - Text Content */}
                                    <div className="w-full md:w-3/5 flex flex-col justify-center py-4 md:py-6 lg:py-8 pr-0 md:pr-6 lg:pr-8">
                                        <div className="space-y-1 sm:space-y-2">
                                            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-white line-clamp-2">
                                                {currentItem.title}
                                            </h2>
                                            
                                            {currentItem.description && (
                                                <p className="text-gray-300 text-xs xs:text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mt-1 sm:mt-2">
                                                    {currentItem.description}
                                                </p>
                                            )}
                                            
                                            {/* Genres */}
                                            {currentItem.genres && currentItem.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                                                    {currentItem.genres.slice(0, 4).map((genre, index) => (
                                                        <span 
                                                            key={index} 
                                                            className="px-2 xs:px-3 py-0.5 xs:py-1 bg-[#1a1625]/70 text-white text-[10px] xs:text-xs rounded-full"
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* CTA Button */}
                                            <div className="mt-3 sm:mt-4">
                                                <Link
                                                    href={`/hentai/${currentItem.id}`}
                                                    className="inline-flex items-center px-4 xs:px-5 py-1.5 xs:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-full transition-colors text-sm xs:text-base"
                                                >
                                                    <span>Vizionează acum</span>
                                                    <HiPlay className="h-3 w-3 xs:h-4 xs:w-4 ml-1 xs:ml-2" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Right Side - Larger Image (desktop only) */}
                                    <div className="hidden md:block md:w-2/5 relative h-full">
                                        <div className="absolute -right-2 lg:-right-4 -bottom-8 lg:-bottom-12 h-[110%] lg:h-[120%] w-auto">
                                            <div className="h-full w-auto transform rotate-6 origin-bottom-right shadow-xl rounded-lg overflow-hidden">
                                                {/* Skeleton for right side image */}
                                                {!imageLoaded && !imageError && (
                                                    <ImageSkeleton className="h-full w-auto" />
                                                )}
                                                <Image
                                                    src={currentItem.posterPath}
                                                    alt={currentItem.title}
                                                    width={300}
                                                    height={450}
                                                    sizes="(max-width: 1024px) 300px, 350px"
                                                    className={`h-full w-auto object-cover transition-opacity duration-300 ${
                                                        imageLoaded ? 'opacity-100' : 'opacity-0'
                                                    }`}
                                                    quality={60}
                                                    placeholder="blur"
                                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                    onLoad={() => setImageLoaded(true)}
                                                    onError={() => setImageError(true)}
                                                    loading='lazy'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </SimpleTransition>
            
            {/* Navigation Dots - Only show if more than 1 slide */}
            {items.length > 1 && (
                <div className="absolute bottom-2 xs:bottom-3 right-3 xs:right-4 z-30 flex space-x-1">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleManualNavigation(() => goToSlide(index))}
                            className={`h-1.5 xs:h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                    ? 'bg-white w-4 xs:w-6' 
                                    : 'bg-white/40 hover:bg-white/60 w-1.5 xs:w-2'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
            
            {/* Navigation Arrows - Only show if more than 1 slide */}
            {items.length > 1 && (
                <>
                    <button 
                        onClick={() => handleManualNavigation(prevSlide)}
                        className="absolute left-1 xs:left-2 top-1/2 -translate-y-1/2 z-30 p-1 xs:p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                        aria-label="Previous slide"
                    >
                        <HiChevronLeft className="h-4 w-4 xs:h-5 xs:w-5" />
                    </button>
                    
                    <button 
                        onClick={() => handleManualNavigation(nextSlide)}
                        className="absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 z-30 p-1 xs:p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                        aria-label="Next slide"
                    >
                        <HiChevronRight className="h-4 w-4 xs:h-5 xs:w-5" />
                    </button>
                </>
            )}
        </div>
    );
};

export default AnimeSlider;