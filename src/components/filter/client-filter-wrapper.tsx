'use client';

import { useState, useEffect } from 'react';
import FilterOptions from './filter-options-anime';
import MediaGrid from '@/components/ui/media-grid-anime';
import ClientPagination from '@/components/ui/client-pagination';

interface Genre {
    _id: string;
    name: string;
}

// AnimeData interface no longer needed - using serialized data from API

interface ClientFilterWrapperProps {
    initialGenres: Genre[];
    initialAnimes: any[];
    initialTotalPages: number;
    initialTotalCount: number;
}

const ClientFilterWrapper = ({
    initialGenres,
    initialAnimes,
    initialTotalPages,
    initialTotalCount
}: ClientFilterWrapperProps) => {
    const [genres] = useState(initialGenres);
    const [animes, setAnimes] = useState(initialAnimes);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    
    // Filter states
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [currentSort, setCurrentSort] = useState('latest');
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize filters from sessionStorage on mount
    useEffect(() => {
        const savedFilters = sessionStorage.getItem('animeFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                setSelectedGenres(filters.genres || []);
                setCurrentSort(filters.sort || 'latest');
                setSearchQuery(filters.search || '');
                setCurrentPage(1);
                // Clear the sessionStorage after reading
                sessionStorage.removeItem('animeFilters');
            } catch (error) {
                console.error('Error parsing saved filters:', error);
            }
        }
        setInitialized(true);
    }, []);

    // Fetch filtered data when filters change
    useEffect(() => {
        if (!initialized) return; // Don't fetch until initialized
        
        const fetchFilteredData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    perPage: '18',
                    search: searchQuery,
                    genres: selectedGenres.join(','),
                    sort: currentSort
                });
                
                const response = await fetch(`/api/animes/filter?${params}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch filtered data');
                }
                
                const { media, totalPages: newTotalPages, totalCount: newTotalCount } = await response.json();
                
                setAnimes(media || []);
                setTotalPages(newTotalPages);
                setTotalCount(newTotalCount);
            } catch (error) {
                console.error('Error fetching filtered data:', error);
                // Keep existing data on error
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredData();
    }, [initialized, selectedGenres, currentSort, searchQuery, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (updates: { genres?: string[], sort?: string, search?: string }) => {
        if (updates.genres !== undefined) setSelectedGenres(updates.genres);
        if (updates.sort !== undefined) setCurrentSort(updates.sort);
        if (updates.search !== undefined) setSearchQuery(updates.search);
        setCurrentPage(1); // Reset to first page when filters change
    };

    return (
        <>
            <FilterOptions
                allGenres={genres}
                selectedGenres={selectedGenres}
                currentSort={currentSort}
                searchQuery={searchQuery}
                mediaType="anime"
                onFilterChange={handleFilterChange}
            />

            {/* Results Header */}
            <div className="mt-8 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                            {totalCount > 0
                                ? `Rezultate găsite`
                                : `Niciun rezultat`}
                        </h2>
                        {totalCount > 0 && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
                                <span className="text-sm font-medium text-gray-300">
                                    {totalCount.toLocaleString()} anime{totalCount === 1 ? '' : '-uri'}
                                </span>
                            </div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className="text-sm text-gray-400">
                            Pagina {currentPage} din {totalPages}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/20 border-t-purple-500 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    </div>
                    <p className="mt-6 text-lg text-gray-300 font-medium">Se încarcă anime-urile...</p>
                    <p className="mt-2 text-sm text-gray-400">Vă rugăm să așteptați</p>
                </div>
            ) : totalCount > 0 ? (
                <div className="space-y-8">
                    <MediaGrid items={animes} />
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-4">
                            <ClientPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                            Nu am găsit niciun anime
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Încearcă să modifici filtrele sau termenii de căutare pentru a găsi anime-urile dorite.
                        </p>
                        <button 
                            onClick={() => handleFilterChange({ genres: [], sort: 'latest', search: '' })}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-300 font-medium rounded-lg border border-purple-500/30 transition-all duration-200"
                        >
                            Resetează filtrele
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClientFilterWrapper;