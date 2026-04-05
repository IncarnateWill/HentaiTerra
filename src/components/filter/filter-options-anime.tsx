'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    HiSearch,
    HiX,
    HiSelector,
    HiTag,
    HiSortAscending,
    HiCheck,
    HiFilm,
    HiAdjustments
} from 'react-icons/hi';

interface FilterOptionsProps {
    allGenres: {
        _id: string;
        name: string;
    }[];
    selectedGenres: string[];
    currentSort: string;
    searchQuery: string;
    mediaType: 'anime';
    onFilterChange?: (updates: { genres?: string[], sort?: string, search?: string }) => void;
}

const sortOptions = [
    { value: 'latest', label: 'Latest Upload', icon: HiSelector },
    { value: 'views', label: 'Most Viewed', icon: HiSelector },
    { value: 'likes', label: 'Most Liked', icon: HiSelector },
    { value: 'alphabetical', label: 'Alphabetical (A-Z)', icon: HiSelector }
];

const mediaOptions = [
    { value: 'anime', label: 'Hentai', icon: HiFilm }
];

const FilterOptions = ({
    allGenres,
    selectedGenres,
    currentSort,
    searchQuery,
    mediaType,
    onFilterChange
}: FilterOptionsProps) => {
    // Router no longer needed for client-side filtering
    const [search, setSearch] = useState(searchQuery);
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const mediaDropdownRef = useRef<HTMLDivElement>(null);

    const handleDropdownClose = useCallback(() => {
        setIsGenreDropdownOpen(false);
        setIsSortDropdownOpen(false);
        setIsMediaDropdownOpen(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!genreDropdownRef.current?.contains(event.target as Node) &&
                !sortDropdownRef.current?.contains(event.target as Node) &&
                !mediaDropdownRef.current?.contains(event.target as Node)) {
                handleDropdownClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleDropdownClose]);

    const updateFilters = useCallback((updates: Record<string, string | string[] | null>) => {
        if (!onFilterChange) return;
        
        const filterUpdates: { genres?: string[], sort?: string, search?: string } = {};
        
        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'genres' && Array.isArray(value)) {
                filterUpdates.genres = value;
            } else if (key === 'sort' && typeof value === 'string') {
                filterUpdates.sort = value;
            } else if (key === 'q' && typeof value === 'string') {
                filterUpdates.search = value;
            }
        });
        
        onFilterChange(filterUpdates);
    }, [onFilterChange]);

    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (search !== searchQuery) {
                updateFilters({ q: search });
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [search, searchQuery, updateFilters]);

    const renderDropdownButton = (
        label: string,
        icon: React.ReactElement,
        isOpen: boolean,
        onClick: () => void,
        badge?: number
    ) => (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {icon}
            <span>{label}</span>
            {badge !== undefined && (
                <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
                <HiAdjustments className="w-5 h-5" />
                <span>{isFilterExpanded ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            {isFilterExpanded && (
                <div className="flex flex-wrap gap-4 p-4 bg-neutral-800/50 rounded-lg">
                    <div className="flex-grow min-w-[200px]">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search hentais..."
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

                    <div className="flex flex-wrap gap-4">

                        <div className="relative" ref={genreDropdownRef}>
                            {renderDropdownButton(
                                selectedGenres.length === 0 
                                    ? 'Select Genres' 
                                    : selectedGenres.length === 1 
                                        ? '1 Genre Selected'
                                        : `${selectedGenres.length} Genres Selected`,
                                <HiTag className="w-5 h-5" />,
                                isGenreDropdownOpen,
                                () => setIsGenreDropdownOpen(!isGenreDropdownOpen),
                                selectedGenres.length > 0 ? selectedGenres.length : undefined
                            )}

                            {isGenreDropdownOpen && (
                                <div className="absolute z-50 mt-2 w-64 p-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
                                    {/* Selection limit feedback */}
                                    <div className="px-3 py-2 mb-2 text-sm text-gray-400 border-b border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <span>Select up to 5 genres</span>
                                            <span className={`font-medium ${
                                                selectedGenres.length >= 5 ? 'text-yellow-400' : 'text-blue-400'
                                            }`}>
                                                {selectedGenres.length}/5
                                            </span>
                                        </div>
                                        {selectedGenres.length >= 5 && (
                                            <div className="mt-1 text-xs text-yellow-400">
                                                Maximum genres selected. Unselect one to choose another.
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Clear all button */}
                                    {selectedGenres.length > 0 && (
                                        <button
                                            onClick={() => updateFilters({ genres: [] })}
                                            className="w-full px-3 py-2 mb-2 text-sm text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded transition-colors"
                                        >
                                            Clear all genres
                                        </button>
                                    )}
                                    
                                    <div className="max-h-64 overflow-y-auto space-y-1">
                                        {allGenres.map((genre) => {
                                            const isSelected = selectedGenres.includes(genre._id);
                                            const canSelect = isSelected || selectedGenres.length < 5;
                                            
                                            return (
                                                <button
                                                    key={genre._id}
                                                    onClick={() => {
                                                        if (!canSelect && !isSelected) return;
                                                        
                                                        const newGenres = isSelected
                                                            ? selectedGenres.filter(id => id !== genre._id)
                                                            : [...selectedGenres, genre._id];
                                                        updateFilters({ genres: newGenres });
                                                    }}
                                                    disabled={!canSelect && !isSelected}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded transition-colors ${
                                                        canSelect || isSelected
                                                            ? 'hover:bg-neutral-700 cursor-pointer'
                                                            : 'opacity-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <span className={isSelected ? 'text-blue-400 font-medium' : ''}>
                                                        {genre.name}
                                                    </span>
                                                    {isSelected && (
                                                        <HiCheck className="w-5 h-5 text-blue-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <div className="relative" ref={sortDropdownRef}>
                            {renderDropdownButton(
                                `Sort by: ${sortOptions.find(opt => opt.value === currentSort)?.label}`,
                                <HiSortAscending className="w-5 h-5" />,
                                isSortDropdownOpen,
                                () => setIsSortDropdownOpen(!isSortDropdownOpen)
                            )}

                            {isSortDropdownOpen && (
                                <div className="absolute z-50 mt-2 w-48 py-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                updateFilters({ sort: option.value });
                                                setIsSortDropdownOpen(false);
                                            }}
                                            className="flex items-center justify-between w-full px-4 py-2 hover:bg-neutral-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <option.icon className="w-5 h-5" />
                                                <span>{option.label}</span>
                                            </div>
                                            {currentSort === option.value && (
                                                <HiCheck className="w-5 h-5 text-blue-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div> */}
                    </div>
                    
                    {/* Selected genres display */}
                    {selectedGenres.length > 0 && (
                        <div className="mt-4 p-3 bg-neutral-800/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <HiTag className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-gray-300">
                                    Selected Genres ({selectedGenres.length}/5):
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedGenres.map((genreId) => {
                                    const genre = allGenres.find(g => g._id === genreId);
                                    if (!genre) return null;
                                    
                                    return (
                                        <div
                                            key={genreId}
                                            className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300"
                                        >
                                            <span>{genre.name}</span>
                                            <button
                                                onClick={() => {
                                                    const newGenres = selectedGenres.filter(id => id !== genreId);
                                                    updateFilters({ genres: newGenres });
                                                }}
                                                className="ml-1 hover:text-blue-100 transition-colors"
                                                title={`Remove ${genre.name}`}
                                            >
                                                <HiX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterOptions;
