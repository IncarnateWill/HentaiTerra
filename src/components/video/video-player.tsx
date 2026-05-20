'use client';

import { useState, useRef, useCallback, Suspense, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import AutoWatchMarker from './auto-watch-marker';
import WatchPointsTracker from './WatchPointsTracker';

// Lazy-load the source buttons (minor perf win)
const VideoControls = dynamic(() => import('./video-controls'), {
  loading: () => <div className="animate-pulse bg-white/5 h-10 rounded-lg" />,
  ssr: false,
});

// ─────────────────────────────────────────────────────────────
// Source-name resolver (domain → display name)
// ─────────────────────────────────────────────────────────────
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
  'do7go.com': 'DoodStream',
  'luluvdo.com': 'LuluStream',
  'yourupload.com': 'YourUpload',
  'vidoza.net': 'Vidoza',
  'filemoon.to': 'FileMoon',
  'filemoon.sx': 'FileMoon',
  'streamsb.net': 'StreamSB',
  'filemoon.org': 'FileMoon',
  'sendvid.com': 'SendVid',
  'mega.nz': 'Mega',
  'voe.sx': 'Voe',
  'video.sibnet.ru': 'Sibnet',
  'vidply.com': 'VidStream',
  'lulu.st': 'LuluStream',
  'luluvid.com': 'LuluStream',
  'terra.strp2p.site': 'TerraStream',
  'abstream.to': 'AbStream',
  'streamlare.com': 'StreamLare',
  'luluvdoo.com': 'LuluStream',
  'hexload.com': 'HexLoad',
  'terra.rpmstream.live': 'TerraStream2',
};

function getSourceName(url: string): string {
  try {
    let normalized = url.trim();
    if (normalized.startsWith('//')) normalized = 'https:' + normalized;
    else if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
    const { hostname } = new URL(normalized);
    return domainMappings[hostname.replace(/^www\./i, '').toLowerCase()] || hostname;
  } catch {
    return 'Unknown Source';
  }
}

// ─────────────────────────────────────────────────────────────
// Domain replacement — mirrors iamcdn replace-domain.js logic
// Handles it directly so we never depend on script timing.
// ─────────────────────────────────────────────────────────────
function normalizeSourceUrl(url: string): string {
  if (!url) return url;
  if (url.includes('short.ink/'))  return url.replace('short.ink/',  'abyssplayer.com/');
  if (url.includes('short.icu/'))  return url.replace('short.icu/',  'abyssplayer.com/');
  return url;
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
export interface VideoPlayerProps {
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

// ─────────────────────────────────────────────────────────────
// VideoPlayerWithSources
// Fully self-contained Client Component:
//   • aspect-video iframe
//   • AutoWatchMarker + WatchPointsTracker (invisible helpers)
//   • Source-selector card beneath the video
// Only receives serialisable (string/number) props → no render-prop
// boundary issues when called from a Server Component.
// ─────────────────────────────────────────────────────────────
export const VideoPlayerWithSources = memo((props: VideoPlayerProps) => {
  const {
    videoUrl,
    videoUrlBackup,
    videoUrlBackup2,
    videoUrlBackup3,
    episodeId,
    animeId,
    title,
  } = props;

  const [selectedSource, setSelectedSource] = useState(() => normalizeSourceUrl(videoUrl));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoSources = useMemo(() => {
    const raw = [
      { url: videoUrl },
      ...(videoUrlBackup  ? [{ url: videoUrlBackup  }] : []),
      ...(videoUrlBackup2 ? [{ url: videoUrlBackup2 }] : []),
      ...(videoUrlBackup3 ? [{ url: videoUrlBackup3 }] : []),
    ]
      .filter(s => s.url)
      .map(s => ({ ...s, url: normalizeSourceUrl(s.url) })); // ← normalize here

    return raw.map((s, i) => ({
      url: s.url,
      name: getSourceName(s.url),
      label: `Source ${i + 1}`,
    }));
  }, [videoUrl, videoUrlBackup, videoUrlBackup2, videoUrlBackup3]);

  const handleSourceSelect = useCallback((url: string) => {
    setSelectedSource(url);
    setIsLoading(true);
    setError(null);
  }, []);

  const handleViewCount = useCallback(async () => {
    try {
      await fetch(`/api/episodes/${episodeId}/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, animeId }),
      });
    } catch (e) {
      console.error('[VideoPlayer] view count error:', e);
    }
  }, [episodeId, animeId]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    handleViewCount();
  }, [handleViewCount]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load video. Please try another source.');
    const idx = videoSources.findIndex(s => s.url === selectedSource);
    if (idx < videoSources.length - 1) handleSourceSelect(videoSources[idx + 1].url);
  }, [selectedSource, videoSources, handleSourceSelect]);

  return (
    <div className="w-full space-y-4">
      {/* ── Iframe box ── constrained to aspect-video, nothing else inside */}
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(var(--color-primary-500),0.15)] ring-1 ring-white/10">
        {/* Invisible client-side helpers */}
        <AutoWatchMarker episodeId={episodeId} animeId={animeId} />
        <WatchPointsTracker episodeId={episodeId} />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="text-white text-center p-4 max-w-[90%]">
              <p className="mb-3 text-sm sm:text-base">{error}</p>
              <button
                onClick={() => { setError(null); setIsLoading(true); }}
                className="px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors text-sm"
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
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* ── Source selector card — lives OUTSIDE the aspect-video box ── */}
      {videoSources.length > 1 && (
        <div className="bg-dark-400/40 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/5 shadow-xl ring-1 ring-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
            Select Server
          </p>
          <Suspense fallback={<div className="animate-pulse bg-white/5 h-10 rounded-lg" />}>
            <VideoControls
              sources={videoSources}
              selectedSource={selectedSource}
              onSourceSelect={handleSourceSelect}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
});

VideoPlayerWithSources.displayName = 'VideoPlayerWithSources';

// Default export kept for backward compatibility
export default VideoPlayerWithSources;