'use client';

import dynamic from 'next/dynamic';
import type { VideoPlayerProps } from './video-player';

// ssr:false is allowed here because this file is a Client Component ('use client')
const VideoPlayerWithSources = dynamic(
  () => import('./video-player').then(m => ({ default: m.VideoPlayerWithSources })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-dark-500/50 aspect-video rounded-2xl" />
    ),
  }
);

export default function VideoPlayerClient(props: VideoPlayerProps) {
  return <VideoPlayerWithSources {...props} />;
}
