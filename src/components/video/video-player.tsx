'use client';

import { useState, useEffect, useRef, useCallback, Suspense, lazy, memo, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Lazy load heavy components with loading fallback
const VideoControls = dynamic(() => import('./video-controls'), {
  loading: () => <div className="animate-pulse bg-neutral-800/50 h-12 rounded-lg" />,
  ssr: false
});

// Memoize the source name function to prevent unnecessary recalculations
const getSourceName = (() => {
  const domainMappings: Record<string, string> = {
    'short.icu': 'Abyss',
    'mp4upload.com': 'MP4Upload',
    'streamtape.com': 'StreamTape',
    'dood.re': 'DoodStream',
    'doodstream.com': 'DoodStream',
    'uptobox.com': 'Uptobox',
    'uptostream.com': 'Uptostream',
    'streamango.com': 'Streamango',
    'streamcloud.eu': 'StreamCloud',
    'dood.li': 'DoodStream',
    "do7go.com": "DoodStream",
    'luluvdo.com': 'LuluStream',
    'yourupload.com': 'YourUpload',
    'vidoza.net': 'Vidoza',
    'filemoon.to': 'FileMoon',
    'filemoon.sx': 'FileMoon',
    'streamsb.net': 'StreamSB',
    'filemoon.org': 'FileMoon',
    'sendvid.com': 'SendVid',
    "mega.nz": "Mega",
    'voe.sx': 'Voe',
    'video.sibnet.ru': 'Sibnet',
    'vidply.com': 'VidStream',
    "lulu.st": 'LuluStream',
    'luluvid.com': 'LuluStream',
    'terra.strp2p.site': 'TerraStream',
    'abstream.to': 'AbStream',
    'streamlare.com': 'StreamLare',
    'luluvdoo.com': 'LuluStream',
    'hexload.com': 'HexLoad',
    'terra.rpmstream.live': 'TerraStream2'
  };

  return (url: string): string => {
    try {
      let normalizedUrl = url.trim();
      if (normalizedUrl.startsWith('//')) {
        normalizedUrl = 'https:' + normalizedUrl;
      } 
      else if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const parsedUrl = new URL(normalizedUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase();
      return domainMappings[hostname] || hostname;
    } catch (error) {
      console.error('Invalid URL:', url, error);
      return 'Unknown Source';
    }
  };
})();

interface VideoPlayerProps {
    videoUrl: string;
    videoUrlBackup: string;
    videoUrlBackup2: string;
    videoUrlBackup3: string;
    episodeId: string;
    animeId: string;
    title: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    loading: string;
}

// Memoized VideoPlayer component
const VideoPlayer = memo(({
  videoUrl,
  videoUrlBackup,
  videoUrlBackup2,
  videoUrlBackup3,
  episodeId,
  animeId,
  title
}: VideoPlayerProps) => {
  const [selectedSource, setSelectedSource] = useState(videoUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize video sources
  const videoSources = useMemo(() => {
    const sources = [
      { url: videoUrl, name: getSourceName(videoUrl) },
      ...(videoUrlBackup ? [{ url: videoUrlBackup, name: getSourceName(videoUrlBackup) }] : []),
      ...(videoUrlBackup2 ? [{ url: videoUrlBackup2, name: getSourceName(videoUrlBackup2) }] : []),
      ...(videoUrlBackup3 ? [{ url: videoUrlBackup3, name: getSourceName(videoUrlBackup3) }] : [])
    ].filter(source => source.url);

    return sources.map((source, index) => ({
      ...source,
      label: `Source ${index + 1}`
    }));
  }, [videoUrl, videoUrlBackup, videoUrlBackup2, videoUrlBackup3]);

  // Handle source selection
  const handleSourceSelect = useCallback((url: string) => {
    setSelectedSource(url);
    setIsLoading(true);
    setError(null);
  }, []);

  // Handle view count
  const handleViewCount = useCallback(async () => {
    try {
      await fetch(`/api/episodes/${episodeId}/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeId,
          animeId
        }),
      });
    } catch (error) {
      console.error('[VideoPlayer] Error updating view count:', error);
    }
  }, [episodeId, animeId]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    handleViewCount();
  }, [handleViewCount]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load video. Please try another source.');
    const currentIndex = videoSources.findIndex(source => source.url === selectedSource);
    if (currentIndex < videoSources.length - 1) {
      handleSourceSelect(videoSources[currentIndex + 1].url);
    }
  }, [selectedSource, videoSources, handleSourceSelect]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center p-4 max-w-[90%]">
              <p className="mb-2 text-sm sm:text-base">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                }}
                className="px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={selectedSource}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="no-referrer"
          loading="lazy"
          title={title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      <div className="px-4 pb-2">
        <Suspense fallback={<div className="h-20 animate-pulse bg-white/5 rounded-lg mt-4" />}>
          <VideoControls
            sources={videoSources}
            selectedSource={selectedSource}
            onSourceSelect={handleSourceSelect}
          />
        </Suspense>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;