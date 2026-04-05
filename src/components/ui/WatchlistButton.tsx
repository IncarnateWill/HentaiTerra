"use client";

import { useState } from 'react';
import { auth } from '@clerk/nextjs/server';

interface WatchlistButtonProps {
    animeId: string;
    initialStatus?: 'watching' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch' | null;
}

export default function WatchlistButton({ animeId, initialStatus }: WatchlistButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToWatchlist = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/watchlist/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ animeId })
            });

            if (response.ok) {
                setStatus('plan-to-watch');
            }
        } catch (error) {
            console.error('Error adding to watchlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: typeof status) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/watchlist/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ animeId, status: newStatus })
            });

            if (response.ok) {
                setStatus(newStatus);
            }
        } catch (error) {
            console.error('Error updating watchlist status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromWatchlist = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/watchlist/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ animeId })
            });

            if (response.ok) {
                setStatus(null);
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative inline-block text-left">
            {status ? (
                <div className="flex items-center gap-2">
                    <select
                        value={status}
                        onChange={(e) => handleUpdateStatus(e.target.value as typeof status)}
                        disabled={isLoading}
                        className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="watching">Watching</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                        <option value="dropped">Dropped</option>
                        <option value="plan-to-watch">Plan to Watch</option>
                    </select>
                    <button
                        onClick={handleRemoveFromWatchlist}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-600 px-2 py-1 rounded"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleAddToWatchlist}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors duration-200"
                >
                    Add to Watchlist
                </button>
            )}
        </div>
    );
}