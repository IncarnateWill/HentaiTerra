'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { awardWatchPoints, syncWatchTime } from '@/actions/economy.actions';
import toast from 'react-hot-toast';

const POINTS_PER_INTERVAL = 10;
const INTERVAL_SECONDS = 600; // 10 minutes
const SHORT_EP_CHECK = 300; // 5 min
const MID_EP_BONUS_INTERVAL = 1;

export default function WatchPointsTracker({ episodeId }: { episodeId: string }) {
    const { isSignedIn } = useUser();
    const watchStartRef = useRef(Date.now());
    const lastPointsAwardRef = useRef(0);
    const shortEpBonusGivenRef = useRef(false);
    const midEpBonusGivenRef = useRef(false);
    const historyIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isSignedIn) return;

        const interval = setInterval(async () => {
            const elapsed = Math.floor((Date.now() - watchStartRef.current) / 1000);
            
            // Sync progress silently to DB every 30 seconds
            try {
                const syncRes = await syncWatchTime(episodeId, elapsed, historyIdRef.current || undefined);
                if (syncRes.success && syncRes.historyId) {
                    historyIdRef.current = syncRes.historyId;
                    if (syncRes.newPoints !== undefined) {
                        window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: syncRes.newPoints } }));
                    }
                }
            } catch (e) {
                console.error("Error syncing watch time:", e);
            }
            
            // Short episode bonus
            if (
                elapsed >= SHORT_EP_CHECK &&
                lastPointsAwardRef.current === 0 &&
                !shortEpBonusGivenRef.current
            ) {
                shortEpBonusGivenRef.current = true;
                const bonus = Math.floor(Math.random() * 10) + 1;
                const res = await awardWatchPoints(episodeId, elapsed, bonus, historyIdRef.current || undefined);
                if (res.success) {
                    if (res.historyId) historyIdRef.current = res.historyId;
                    toast.success(`Ai câștigat un bonus de ${bonus} puncte pentru vizionare!`);
                    window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: res.points } }));
                }
            }

            const intervalsCompleted = Math.floor(elapsed / INTERVAL_SECONDS);
            const newIntervals = intervalsCompleted - lastPointsAwardRef.current;
            
            if (newIntervals > 0) {
                lastPointsAwardRef.current = intervalsCompleted;
                
                let earnedNow = 0;
                for (let k = 0; k < newIntervals; k++) {
                    earnedNow += Math.floor(Math.random() * 46) + 5; // Random between 5 and 50
                }
                
                const res = await awardWatchPoints(episodeId, elapsed, earnedNow, historyIdRef.current || undefined);
                if (res.success) {
                    if (res.historyId) historyIdRef.current = res.historyId;
                    toast.success(`Ai câștigat ${earnedNow} puncte pentru vizionare!`);
                    window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: res.points } }));
                }

                // Mid-length bonus
                if (intervalsCompleted === MID_EP_BONUS_INTERVAL && !midEpBonusGivenRef.current) {
                    midEpBonusGivenRef.current = true;
                    const bonus = Math.floor(Math.random() * 10) + 1;
                    const bonusRes = await awardWatchPoints(episodeId, elapsed, bonus, historyIdRef.current || undefined);
                    if (bonusRes.success) {
                        if (bonusRes.historyId) historyIdRef.current = bonusRes.historyId;
                        toast.success(`Bonus extra de ${bonus} puncte!`);
                        window.dispatchEvent(new CustomEvent("points-updated", { detail: { points: bonusRes.points } }));
                    }
                }
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [isSignedIn, episodeId]);

    return null; // Invisible component
}
