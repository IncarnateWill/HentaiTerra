'use client';

import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { memo } from 'react';

interface ClientPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const ClientPagination = memo(({ currentPage, totalPages, onPageChange, className = '' }: ClientPaginationProps) => {
    const renderPageNumbers = () => {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        
        let start = Math.max(1, currentPage - halfVisible);
        const end = Math.min(start + maxVisiblePages - 1, totalPages);
        
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return (
            <>
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                            page === currentPage
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                                : 'bg-gray-800/60 border border-gray-600/50 hover:bg-gray-700/60 hover:border-gray-500/50 text-gray-300 hover:text-white'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}
            </>
        );
    };

    const navigationButton = (page: number, Icon: typeof HiChevronLeft, label: string) => (
        <button
            onClick={() => onPageChange(page)}
            className="p-2.5 bg-gray-800/60 border border-gray-600/50 rounded-lg hover:bg-gray-700/60 hover:border-gray-500/50 transition-all duration-200 focus:ring-2 focus:ring-purple-500/50 focus:outline-none text-gray-300 hover:text-white"
            aria-label={label}
        >
            <Icon className="w-5 h-5" aria-hidden="true" />
        </button>
    );

    return (
        <nav aria-label="Pagination" className={`${className} mt-8`}>
            <div className="flex justify-center items-center space-x-2">
                {currentPage > 1 && (
                    <>
                        {navigationButton(1, HiChevronDoubleLeft, "Go to first page")}
                        {navigationButton(currentPage - 1, HiChevronLeft, "Go to previous page")}
                    </>
                )}

                {renderPageNumbers()}

                {currentPage < totalPages && (
                    <>
                        {navigationButton(currentPage + 1, HiChevronRight, "Go to next page")}
                        {navigationButton(totalPages, HiChevronDoubleRight, "Go to last page")}
                    </>
                )}
            </div>
        </nav>
    );
});

ClientPagination.displayName = 'ClientPagination';

export default ClientPagination;