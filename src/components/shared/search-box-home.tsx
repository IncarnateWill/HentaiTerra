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
import { Button, Input, Card, cn } from '@/components/ui';
import { colors } from '@/styles/design-system';

interface SearchResult {
    _id: string;
    name: string;
    poster: string;
    mediaType: string;
    studio: string;
    genres: { _id: string; name: string }[];
}

export default function SearchBoxHome() {
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
        <div className="relative w-full max-w-2xl mx-auto" ref={searchBoxRef}>
            <div className={cn(
                "relative flex rounded-full overflow-hidden",
                "border border-neutral-700/50 shadow-lg",
                "focus-within:ring-2 focus-within:ring-primary-500/50",
                "focus-within:border-primary-500/50",
                "transition-all duration-300 ease-out",
                "bg-gradient-to-r from-neutral-800/90 to-neutral-800/80",
                "backdrop-blur-sm"
            )}>
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Cauta hentai..."
                        className={cn(
                            "w-full px-5 py-4 pl-12 pr-12",
                            "bg-transparent text-white placeholder:text-neutral-400",
                            "focus:outline-none transition-all duration-200",
                            "text-lg font-medium"
                        )}
                        aria-label="Cauta hentai"
                    />
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400 pointer-events-none" />
                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-white z-10"
                            aria-label="Clear search"
                        >
                            <HiX className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSearch}
                    className="flex-shrink-0 px-8 rounded-l-none border-l border-neutral-700/50"
                    aria-label="Perform search"
                >
                    <HiSearch className="w-5 h-5" />
                </Button>
            </div>

            {isFocused && (query.length >= 2 || results.length > 0) && (
                <Card
                    variant="glass"
                    className={cn(
                        "absolute top-full left-0 right-0 mt-2",
                        "border border-neutral-700/50 shadow-2xl",
                        "backdrop-blur-md bg-neutral-800/95",
                        "animate-slideIn z-50"
                    )}
                >
                    {isLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse">
                                    <div className="w-24 h-14 bg-neutral-700/50 rounded-lg" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-neutral-700/50 rounded-md w-3/4" />
                                        <div className="h-3 bg-neutral-700/50 rounded-md w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center text-semantic-error-400">
                            <div className="text-lg font-medium mb-1">Search Error</div>
                            <div className="text-sm text-neutral-400">{error}</div>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {results.map((result, index) => (
                                    <Link
                                        key={result._id}
                                        href={`/hentai/${result._id}`}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg",
                                            "hover:bg-neutral-700/50 transition-all duration-200",
                                            "cursor-pointer group border border-transparent",
                                            "hover:border-primary-500/20 hover:shadow-md",
                                            "animate-fadeIn"
                                        )}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                                            <Image
                                                src={result.poster || "/default-thumbnail.jpg"}
                                                alt={result.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="96px"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-black/90 px-2 py-1 rounded-md text-xs font-medium">
                                                {result.mediaType}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold line-clamp-1 group-hover:text-primary-400 transition-colors duration-200">
                                                {result.name}
                                            </div>
                                            <div className="text-xs text-neutral-400 line-clamp-1 mt-1">
                                                <span className="font-medium">{result.studio}</span>
                                                {result.genres.length > 0 && (
                                                    <span> • {result.genres.map(genre => genre.name).join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <HiArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200" />
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-neutral-700/50">
                                <Button
                                    variant="ghost"
                                    onClick={handleSearch}
                                    className={cn(
                                        "w-full p-4 justify-center gap-2",
                                        "text-primary-400 hover:text-primary-300",
                                        "hover:bg-primary-500/10 transition-all duration-200",
                                        "font-medium"
                                    )}
                                >
                                    Vizualizează toate rezultatele
                                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </div>
                        </>
                    ) : query.length >= 2 ? (
                        <div className="p-6 text-center">
                            <div className="text-lg font-medium text-neutral-300 mb-1">Nici un hentai nu a fost gasit</div>
                            <div className="text-sm text-neutral-400">
                                Nu s-a găsit nici un hentai cu numele &quot;<span className="font-medium text-white">{query}</span>&quot;
                            </div>
                        </div>
                    ) : null}
                </Card>
            )}
        </div>
    );
}