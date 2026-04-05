'use client'

import { useEffect, useRef } from 'react';

interface AutoWatchMarkerProps {
  episodeId: string;
  animeId: string;
}

export default function AutoWatchMarker({ episodeId, animeId }: AutoWatchMarkerProps) {

  
const watchProgressRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isWatchedRef = useRef<boolean>(false);

  useEffect(() => {

    const WATCH_PROGRESS_KEY = `episode-${episodeId}-progress`;
    const WATCH_START_KEY = `episode-${episodeId}-start`;
    
    // Check if we have an existing progress
    const savedProgress = localStorage.getItem(WATCH_PROGRESS_KEY);
    const savedStartTime = localStorage.getItem(WATCH_START_KEY);
    const isWatched = localStorage.getItem(`episode-${episodeId}-watched`) === 'true';
    
    if (isWatched) {
      isWatchedRef.current = true;
      return; // Don't track if already marked as watched
    }

    // Initialize or restore progress
    if (savedProgress && savedStartTime) {
      const elapsedTime = (Date.now() - parseInt(savedStartTime)) / 1000;
      watchProgressRef.current = Math.min(300, parseInt(savedProgress) + elapsedTime);
    } else {
      watchProgressRef.current = 0;
      localStorage.setItem(WATCH_START_KEY, Date.now().toString());
      localStorage.setItem(WATCH_PROGRESS_KEY, '0');
    }

    // Update progress every 30 seconds
    const progressTimer = setInterval(async () => {
      if (isWatchedRef.current) return;

      watchProgressRef.current += 30;
      localStorage.setItem(WATCH_PROGRESS_KEY, watchProgressRef.current.toString());

      // Check if we've reached 5 minutes (300 seconds)
      if (watchProgressRef.current >= 300) {
        await markAsWatched();
      }
    }, 30000);

    async function markAsWatched() {
      if (isWatchedRef.current) return;

      try {
        const response = await fetch('/api/watchlist/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            animeId,
            episodeId,
            isWatched: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.message?.includes("User not logged in")) {
            isWatchedRef.current = true; // Prevents re-trying for this session
            return;
          }
          isWatchedRef.current = true;
          localStorage.setItem(`episode-${episodeId}-watched`, 'true');
          console.log('Episode marked as watched');
        } else {
          const error = await response.text();
          throw new Error(error);
        }
      } catch (error) { 
        console.error('Failed to mark episode as watched:', error);
      }
    }

    // Cleanup function
    return () => {
      clearInterval(progressTimer);
      // Save final progress before unmounting
      if (!isWatchedRef.current && watchProgressRef.current < 300) {
        localStorage.setItem(WATCH_PROGRESS_KEY, watchProgressRef.current.toString());
      }
    };
  }, [episodeId, animeId]);

  return null;
}