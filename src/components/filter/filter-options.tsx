// components/filter/filter-options.tsx
'use client';

// Custom CSS for animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideIn {
    animation: slideIn 0.2s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  if (!document.head.querySelector('style[data-filter-animations]')) {
    styleElement.setAttribute('data-filter-animations', 'true');
    document.head.appendChild(styleElement);
  }
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    HiSearch,
    HiX,
    HiSelector,
    HiTag,
    HiSortAscending,
    HiCheck
} from 'react-icons/hi';

interface FilterOptionsProps {
    allGenres: {
        _id: string;
        name: string;
    }[];
    selectedGenres: string[];
    currentSort: string;
    searchQuery: string;
}

const sortOptions = [
    { value: 'latest', label: 'Latest Upload', icon: HiSelector },
    { value: 'views', label: 'Most Viewed', icon: HiSelector },
    { value: 'likes', label: 'Most Liked', icon: HiSelector }
];

const FilterOptions = ({
    allGenres,
    selectedGenres,
    currentSort,
    searchQuery
}: FilterOptionsProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchQuery);
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
                setIsGenreDropdownOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Memoize updateFilters with useCallback
    const updateFilters = useCallback((updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page');

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else {
                params.set(key, value);
            }
        });

        router.push(`/filter?${params.toString()}`);
    }, [router, searchParams]);

    // Sync local search state with props
    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    // Debounce search input with proper dependencies
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== searchQuery) {
                updateFilters({ q: search });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, searchQuery, updateFilters]);

    return (
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-grow min-w-[280px]">
                    <div className="relative group">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Caută anime-uri..."
                            className="w-full px-4 py-3 pr-12 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 group-hover:border-gray-500/50"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                            >
                                <HiX className="w-5 h-5" />
                            </button>
                        )}
                        <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Genre Dropdown */}
                    <div className="relative" ref={genreDropdownRef}>
                        <button
                            onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white min-w-[140px] transform hover:scale-[1.02] ${
                                selectedGenres.length > 0
                                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 shadow-lg shadow-purple-500/10'
                                    : 'bg-gray-800/60 border border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/50'
                            } ${
                                isGenreDropdownOpen ? 'ring-2 ring-purple-500/50 scale-[1.02]' : ''
                            }`}
                        >
                            <HiTag className={`w-5 h-5 transition-all duration-200 ${
                                selectedGenres.length > 0 ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'
                            }`} />
                            <span className="font-medium flex-grow text-left">Genuri</span>
                            <div className="flex items-center gap-2">
                                {selectedGenres.length > 0 && (
                                    <>
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg animate-pulse">
                                            {selectedGenres.length}
                                        </span>
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                                    </>
                                )}
                                <HiSelector className={`w-4 h-4 transition-transform duration-200 ${
                                    isGenreDropdownOpen ? 'rotate-180' : 'rotate-0'
                                } ${
                                    selectedGenres.length > 0 ? 'text-purple-300' : 'text-gray-400 group-hover:text-gray-300'
                                }`} />
                            </div>
                        </button>

                        {isGenreDropdownOpen && (
                            <div className="absolute z-50 mt-2 w-72 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden animate-slideIn">
                                <div className="p-3 border-b border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                                            Selectează genurile
                                        </h3>
                                        {selectedGenres.length > 0 && (
                                            <button
                                                onClick={() => updateFilters({ genres: null })}
                                                className="group text-xs text-purple-400 hover:text-purple-300 transition-all duration-200 font-medium px-2 py-1 rounded hover:bg-purple-500/10 transform hover:scale-105"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <HiX className="w-3 h-3 group-hover:rotate-90 transition-transform duration-200" />
                                                    Șterge toate
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                    <div className="space-y-1">
                                        {allGenres.map((genre, index) => {
                                            const isSelected = selectedGenres.includes(genre._id);
                                            return (
                                                <button
                                                    key={genre._id}
                                                    onClick={() => {
                                                        const newGenres = isSelected
                                                            ? selectedGenres.filter(id => id !== genre._id)
                                                            : [...selectedGenres, genre._id];
                                                        updateFilters({ genres: newGenres.length ? newGenres : null });
                                                    }}
                                                    className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1 ${
                                                        isSelected
                                                            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-l-4 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]'
                                                            : 'hover:bg-gray-800/80 text-gray-300 hover:text-white hover:border-l-4 hover:border-purple-500/50 hover:shadow-md border border-transparent'
                                                    }`}
                                                    style={{
                                                        animationDelay: `${index * 50}ms`
                                                    }}
                                                >
                                                    <span className={`font-medium transition-all duration-300 ${
                                                        isSelected 
                                                            ? 'text-purple-200 font-semibold' 
                                                            : 'text-gray-300 group-hover:text-white group-hover:font-medium'
                                                    }`}>
                                                        {genre.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {isSelected ? (
                                                            <div className="flex items-center gap-2 animate-fadeIn">
                                                                <HiCheck className="w-4 h-4 text-green-400 animate-bounce" />
                                                                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border-2 border-gray-500 group-hover:border-purple-400 transition-all duration-200 group-hover:scale-110"></div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {selectedGenres.length > 0 && (
                                    <div className="p-3 border-t border-gray-700/50 bg-gray-800/30 animate-fadeIn">
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <HiCheck className="w-4 h-4 text-green-400 animate-bounce" />
                                                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                                </div>
                                                <span className="text-sm font-medium text-purple-300">
                                                    Genuri selectate ({selectedGenres.length})
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedGenres.map((genreId, index) => {
                                                    const genre = allGenres.find(g => g._id === genreId);
                                                    return genre ? (
                                                        <span
                                                            key={genreId}
                                                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 text-xs rounded-full border border-purple-500/40 shadow-lg hover:shadow-purple-500/20 transition-all duration-200 hover:scale-105 animate-fadeIn"
                                                            style={{
                                                                animationDelay: `${index * 100}ms`
                                                            }}
                                                        >
                                                            <span className="font-medium">{genre.name}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newGenres = selectedGenres.filter(id => id !== genreId);
                                                                    updateFilters({ genres: newGenres.length ? newGenres : null });
                                                                }}
                                                                className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 transform hover:scale-110 hover:rotate-90"
                                                                title={`Remove ${genre.name}`}
                                                            >
                                                                <HiX className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white min-w-[180px] transform hover:scale-[1.02] ${
                                currentSort !== 'latest'
                                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 shadow-lg shadow-blue-500/10'
                                    : 'bg-gray-800/60 border border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/50'
                            } ${
                                isSortDropdownOpen ? 'ring-2 ring-purple-500/50 scale-[1.02]' : ''
                            }`}
                        >
                            <HiSortAscending className={`w-5 h-5 transition-all duration-200 ${
                                currentSort !== 'latest' ? 'text-blue-300' : 'text-purple-400 group-hover:text-purple-300'
                            }`} />
                            <span className="font-medium flex-grow text-left">
                                {sortOptions.find(opt => opt.value === currentSort)?.label || 'Sortează'}
                            </span>
                            <HiSelector className={`w-4 h-4 transition-transform duration-200 ${
                                isSortDropdownOpen ? 'rotate-180' : 'rotate-0'
                            } ${
                                currentSort !== 'latest' ? 'text-blue-300' : 'text-gray-400 group-hover:text-gray-300'
                            }`} />
                        </button>

                        {isSortDropdownOpen && (
                            <div className="absolute z-50 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden animate-slideIn">
                                <div className="p-3 border-b border-gray-700/50">
                                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                                        Sortează după
                                    </h3>
                                </div>
                                <div className="p-2">
                                    {sortOptions.map((option, index) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                updateFilters({ sort: option.value });
                                                setIsSortDropdownOpen(false);
                                            }}
                                            className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1 ${
                                                currentSort === option.value
                                                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-blue-400 shadow-lg shadow-blue-500/20 scale-[1.02] text-blue-200 font-semibold'
                                                    : 'hover:bg-gray-800/60 text-gray-300 hover:text-white hover:border-l-4 hover:border-blue-500/50 hover:shadow-md border border-transparent'
                                            }`}
                                            style={{
                                                animationDelay: `${index * 100}ms`
                                            }}
                                        >
                                            <option.icon className={`w-4 h-4 transition-all duration-200 ${
                                                currentSort === option.value ? 'text-blue-300' : 'text-gray-400 group-hover:text-blue-300'
                                            }`} />
                                            <span className="font-medium flex-grow text-left">{option.label}</span>
                                            <div className="flex items-center gap-2">
                                                {currentSort === option.value ? (
                                                    <div className="flex items-center gap-2 animate-fadeIn">
                                                        <HiCheck className="w-4 h-4 text-green-400 animate-bounce" />
                                                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                                                    </div>
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-500 group-hover:border-blue-400 transition-all duration-200 group-hover:scale-110"></div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterOptions;