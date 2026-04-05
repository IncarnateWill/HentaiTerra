'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiShare, HiThumbUp, HiThumbDown, HiEye, HiCheck } from "react-icons/hi";
import { HiWrench } from 'react-icons/hi2';
import { useAuth } from '@clerk/nextjs';
import QuickEditButton from '@/components/ui/QuickEditButton';

interface ActionButtonsProps {
    episodeId: string;
    initialLikes: number;
    initialDislikes: number;
    views: number;
    nume: string;
    animeId: string; // Add animeId prop
}

type UserAction = 'like' | 'dislike' | null;
type ActionType = 'like' | 'dislike' | 'remove-like' | 'remove-dislike';

const ActionButtons = ({ episodeId, animeId, initialLikes, initialDislikes, views, nume }: ActionButtonsProps) => {
    const { isSignedIn } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [currentViews, setCurrentViews] = useState(views);
    const [isLoading, setIsLoading] = useState(false);
    const [userAction, setUserAction] = useState<UserAction>(null);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportComment, setReportComment] = useState('');
    const [isWatched, setIsWatched] = useState(false);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);

    useEffect(() => {
        const savedAction = localStorage.getItem(`episode-${episodeId}-action`);
        if (savedAction === 'like' || savedAction === 'dislike') {
            setUserAction(savedAction as UserAction);
        }
        
        // Check if episode is marked as watched
        const checkWatchStatus = async () => {
            if (!isSignedIn) return;
            
            try {
                const WATCH_TIME_KEY = `episode-${episodeId}-watch-time`;
                const watchStartTime = localStorage.getItem(WATCH_TIME_KEY);
                if (!watchStartTime) return;

                const watchDuration = (Date.now() - parseInt(watchStartTime)) / 1000;
                if (watchDuration < 300) return; // Only check status after 5 minutes

                const response = await fetch(`/api/watchlist/check?animeId=${animeId}&episodeId=${episodeId}`, {
                    method: 'GET',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setIsWatched(data.isWatched);
                }
            } catch (error) {
                console.error('Error checking watch status:', error);
            }
        };
        
        checkWatchStatus();
    }, [episodeId, animeId, isSignedIn]);

    // Update views periodically
    useEffect(() => {
        const updateViews = async () => {
            try {
                const response = await fetch(`/api/episodes/${episodeId}/views`);
                if (response.ok) {
                    const data = await response.json();
                    setCurrentViews(data.views);
                }
            } catch (error) {
                console.error('Error fetching views:', error);
            }
        };

        const interval = setInterval(updateViews, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [episodeId]);

    const updateCountsOptimistically = useCallback((action: ActionType) => {
        setLikes(prev => action === 'like' ? prev + 1 : action === 'remove-like' ? prev - 1 : prev);
        setDislikes(prev => action === 'dislike' ? prev + 1 : action === 'remove-dislike' ? prev - 1 : prev);
    }, []);

    const handleAction = async (action: 'like' | 'dislike') => {
        if (isLoading) return;
        setIsLoading(true);
        
        const previousState = {
            likes,
            dislikes,
            userAction
        };

        try {
            let serverAction: ActionType;
            let newUserAction: UserAction;

            if (userAction === action) {
                serverAction = action === 'like' ? 'remove-like' : 'remove-dislike';
                newUserAction = null;
            } else if (userAction) {
                const firstServerAction = userAction === 'like' ? 'remove-like' : 'remove-dislike';
                await updateActionOnServer(firstServerAction);
                serverAction = action;
                newUserAction = action;
                updateCountsOptimistically(firstServerAction);
            } else {
                serverAction = action;
                newUserAction = action;
            }

            updateCountsOptimistically(serverAction);
            setUserAction(newUserAction);

            const result = await updateActionOnServer(serverAction);

            if (result.success) {
                if (newUserAction) {
                    localStorage.setItem(`episode-${episodeId}-action`, newUserAction);
                } else {
                    localStorage.removeItem(`episode-${episodeId}-action`);
                }
                setLikes(result.likes);
                setDislikes(result.dislikes);
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Error updating likes/dislikes:', error);
            // Restore previous state
            setLikes(previousState.likes);
            setDislikes(previousState.dislikes);
            setUserAction(previousState.userAction);
            console.error('Failed to update. Please try again.');

            if (previousState.userAction) {
                localStorage.setItem(`episode-${episodeId}-action`, previousState.userAction);
            } else {
                localStorage.removeItem(`episode-${episodeId}-action`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateActionOnServer = async (action: ActionType) => {
        const response = await fetch(`/api/episodes/${episodeId}/likes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });

        if (!response.ok) throw new Error('Failed to update');
        return response.json();
    };

    const handleReport = async () => {
        if (!reportComment.trim()) {
            console.error('Please enter a description of the problem');
            return;
        }
        
        try {
            setIsLoading(true);
            const url = window.location.href;
            const message = `@everyone Episode ${nume}\nURL: ${url}\nReported Issue: ${reportComment}`;
            
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message }),
            });

            if (!response.ok) throw new Error('Failed to send report');
            
            console.log('Report sent successfully');
            setShowReportForm(false);
            setReportComment('');
        } catch (error) {
            console.error('Error sending report:', error);
            console.error('Failed to send report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleWatched = async () => {
        if (!isSignedIn) {
            console.error('Please sign in to track watched episodes');
            return;
        }
        
        if (isTrackingLoading) return;
        
        setIsTrackingLoading(true);
        try {
            const response = await fetch('/api/watchlist/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    animeId,
                    episodeId,
                    isWatched: !isWatched
                })
            });
            
            if (response.ok) {
                setIsWatched(!isWatched);
                console.log(isWatched ? 'Episode marked as unwatched' : 'Episode marked as watched');
            } else {
                throw new Error('Failed to update watch status');
            }
        } catch (error) {
            console.error('Error updating watch status:', error);
            console.error('Failed to update watch status');
        } finally {
            setIsTrackingLoading(false);
        }
    };

    const formatViews = useCallback((count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    }, []);

    return (
        <div className="py-4 border-b border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-2 text-gray-400">
                    <HiEye className="w-5 h-5" />
                    <span className="text-sm">{formatViews(currentViews)} views</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <button
                        disabled={isLoading}
                        onClick={() => handleAction('like')}
                        className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                            ${userAction === 'like'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-neutral-800 hover:bg-neutral-700'}`}
                    >
                        <HiThumbUp className="w-5 h-5" />
                        <span className="text-sm">{likes}</span>
                    </button>

                    <button
                        disabled={isLoading}
                        onClick={() => handleAction('dislike')}
                        className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                            ${userAction === 'dislike'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-neutral-800 hover:bg-neutral-700'}`}
                    >
                        <HiThumbDown className="w-5 h-5" />
                        <span className="text-sm">{dislikes}</span>
                    </button>

                    {isSignedIn && (
                        <button
                            disabled={isTrackingLoading}
                            onClick={handleToggleWatched}
                            className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition
                                ${isTrackingLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isWatched
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-neutral-800 hover:bg-neutral-700'}`}
                            title={isWatched ? "Mark as unwatched" : "Mark as watched"}
                        >
                            <HiCheck className="w-5 h-5" />
                            <span className="text-sm hidden sm:inline">{isWatched ? 'Watched' : 'Mark watched'}</span>
                        </button>
                    )}

                    <button
                        disabled={isLoading}
                        onClick={() => setShowReportForm(true)}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition bg-neutral-800 hover:bg-neutral-700
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <HiWrench className="w-5 h-5" />
                    </button>

                    <QuickEditButton 
                        editUrl={`/admin/anime/${animeId}/episodes`}
                        label="Quick Edit"
                        variant="outline"
                        size="sm"
                    />
                </div>
            </div>

            {showReportForm && (
                <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
                    <textarea
                        value={reportComment}
                        onChange={(e) => setReportComment(e.target.value)}
                        placeholder="Describe the issue you encountered..."
                        className="w-full p-2 bg-neutral-800 text-white rounded-lg mb-2 text-sm sm:text-base"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <button
                            onClick={() => setShowReportForm(false)}
                            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition text-sm sm:text-base"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReport}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm sm:text-base
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionButtons;
