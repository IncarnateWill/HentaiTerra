'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    HiSearch,
    HiX,
    HiSelector,
    HiTag,
    HiSortAscending,
    HiCheck,
    HiFilm
} from 'react-icons/hi';

interface FilterOptionsProps {
    allGenres: {
        _id: string;
        name: string;
    }[];
    selectedGenres: string[];
    currentSort: string;
    searchQuery: string;
    mediaType: 'movie';
}

const sortOptions = [
    { value: 'latest', label: 'Latest Upload' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likes', label: 'Most Liked' }
];

const mediaOptions = [
    { value: 'movie', label: 'Movie' }];

const FilterOptions = ({
    allGenres,
    selectedGenres,
    currentSort,
    searchQuery,
    mediaType
}: FilterOptionsProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchQuery);
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const mediaDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
                setIsGenreDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortDropdownOpen(false);
            }
            if (mediaDropdownRef.current && !mediaDropdownRef.current.contains(event.target as Node)) {
                setIsMediaDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateFilters = useCallback((updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');
    
        // Always filter for anime
        params.set('mediaType', 'movie');
    
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, value);
            }
        });
    
        router.push(`/movies?${params.toString()}`);
    }, [router, searchParams]);

    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== searchQuery) {
                updateFilters({ q: search });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, searchQuery, updateFilters]);

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-neutral-800/50 rounded-lg">
            {/* Search Input */}
            <div className="flex-grow min-w-[200px]">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search movies..."
                        className="w-full px-4 py-2.5 pr-10 bg-neutral-800 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    )}
                    <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* Media Type Dropdown */}
            <div className="relative" ref={mediaDropdownRef}>
                <button
                    onClick={() => setIsMediaDropdownOpen(!isMediaDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <HiFilm className="w-5 h-5" />
                    <span>{mediaOptions.find(opt => opt.value === mediaType)?.label}</span>
                </button>

                {isMediaDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-48 py-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
                        {mediaOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    updateFilters({ mediaType: option.value });
                                    setIsMediaDropdownOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-4 py-2 hover:bg-neutral-700 transition-colors"
                            >
                                <span>{option.label}</span>
                                {mediaType === option.value && (
                                    <HiCheck className="w-5 h-5 text-blue-500" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Genre Dropdown */}
            <div className="relative" ref={genreDropdownRef}>
                <button
                    onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <HiTag className="w-5 h-5" />
                    <span>Genres</span>
                    <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                        {selectedGenres.length}
                    </span>
                </button>

                {isGenreDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-64 p-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {allGenres.map((genre) => (
                                <button
                                    key={genre._id}
                                    onClick={() => {
                                        const newGenres = selectedGenres.includes(genre._id)
                                            ? selectedGenres.filter(id => id !== genre._id)
                                            : [...selectedGenres, genre._id];
                                        updateFilters({ genres: newGenres.length ? newGenres : null });
                                    }}
                                    className="flex items-center justify-between w-full px-3 py-2 rounded hover:bg-neutral-700 transition-colors"
                                >
                                    <span>{genre.name}</span>
                                    {selectedGenres.includes(genre._id) && (
                                        <HiCheck className="w-5 h-5 text-blue-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
                <button
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <HiSortAscending className="w-5 h-5" />
                    <span>Sort by: {sortOptions.find(opt => opt.value === currentSort)?.label}</span>
                </button>
            </div>
        </div>
    );
};

export default FilterOptions;
