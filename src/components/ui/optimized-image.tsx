'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  aspectRatio?: 'poster' | 'banner' | 'square';
  placeholder?: 'blur' | 'empty';
  quality?: number;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  aspectRatio = 'poster',
  placeholder = 'blur',
  quality = 75
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Default sizes based on aspect ratio
  const getDefaultSizes = () => {
    switch (aspectRatio) {
      case 'poster':
        return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw';
      case 'banner':
        return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
      case 'square':
        return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw';
      default:
        return '100vw';
    }
  };

  // Fallback image based on aspect ratio
  const getFallbackSrc = () => {
    switch (aspectRatio) {
      case 'poster':
        return '/placeholder-poster.jpg';
      case 'banner':
        return '/placeholder-banner.jpg';
      default:
        return '/placeholder.jpg';
    }
  };

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1f2937'; // neutral-800
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const imageProps = {
    src: hasError ? getFallbackSrc() : src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    sizes: sizes || getDefaultSizes(),
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    ...(placeholder === 'blur' && {
      placeholder: 'blur' as const,
      blurDataURL: typeof window !== 'undefined' && width && height 
        ? generateBlurDataURL(width, height)
        : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    })
  };

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          {...imageProps}
          alt={alt}
          fill
          style={{ objectFit: 'cover' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        alt={alt}
        width={width}
        height={height}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-neutral-800 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

// Specialized components for common use cases
export const AnimePosterImage = (props: Omit<OptimizedImageProps, 'aspectRatio'>) => (
  <OptimizedImage {...props} aspectRatio="poster" />
);

export const AnimeBannerImage = (props: Omit<OptimizedImageProps, 'aspectRatio'>) => (
  <OptimizedImage {...props} aspectRatio="banner" />
);

export const AnimeSquareImage = (props: Omit<OptimizedImageProps, 'aspectRatio'>) => (
  <OptimizedImage {...props} aspectRatio="square" />
);