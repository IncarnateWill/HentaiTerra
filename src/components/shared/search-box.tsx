'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    HiSearch,
    HiX,
    HiArrowRight,
    HiClock
} from 'react-icons/hi';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
    _id: string;
    name: string;
    poster: string;
    mediaType: string;
    studio: string;
    genres: { _id: string; name: string }[];
}

export default function SearchBox() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(query, 300);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
            setIsFocused(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const fetchResults = useCallback(async () => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
            if (!res.ok) throw new Error('Failed to fetch results');
            
            const data = await res.json();
            setResults(data.results);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleSearch = useCallback(() => {
        if (query.trim()) {
            sessionStorage.setItem('animeFilters', JSON.stringify({
            genres: [],
            sort: 'latest',
            search: query
        }));
        router.push('/hentais');
            setIsFocused(false);
        }
    }, [query, router]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    return (
        <div className="relative w-[400px]" ref={searchBoxRef}>
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search hentai"
                    className="w-full px-4 py-2.5 pl-11 rounded-lg bg-neutral-800/50 
                        text-white placeholder:text-gray-400 
                        focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                        transition-all duration-200 hover:bg-neutral-800/70"
                    aria-label="Search hentai"
                />
                <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
                    group-focus-within:text-blue-500 transition-colors duration-200" />

                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                            text-gray-400 hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isFocused && (query.length >= 2 || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden z-50">
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-24 h-14 bg-neutral-700 rounded" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-neutral-700 rounded w-3/4" />
                                        <div className="h-3 bg-neutral-700 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-400">
                            {error}
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="p-2 max-h-[400px] overflow-y-auto">
                                {results.map((result) => (
                                    <Link
                                        key={result._id}
                                        href={`/hentai/${result._id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer group"
                                    >
                                        <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={result.poster || "/default-thumbnail.jpg"}
                                                alt={result.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                sizes="96px"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                {result.mediaType}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium line-clamp-1 group-hover:text-blue-400 transition-colors">
                                                {result.name}
                                            </span>
                                            <span className="text-xs text-gray-400 line-clamp-1">
                                                {result.studio} • {result.genres.map(genre => genre.name).join(', ')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <button
                                onClick={handleSearch}
                                className="w-full p-3 flex items-center justify-center gap-2 border-t border-neutral-700 
                                    hover:bg-neutral-700 transition-colors text-blue-400 hover:text-blue-300"
                            >
                                Vezi toate rezultatele
                                <HiArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    ) : query.length >= 2 ? (
                        <div className="p-4 text-center text-gray-400">
                            Nu s-au găsit rezultate pentru &quot;{query}&quot;
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}