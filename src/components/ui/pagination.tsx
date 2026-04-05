'use client';

import Link from 'next/link';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { memo } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams: Record<string, string | undefined>;
    className?: string;
}

const Pagination = memo(({ currentPage, totalPages, baseUrl, searchParams, className = '' }: PaginationProps) => {
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(
            Object.entries(searchParams).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value || ''
            }), {})
        );
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

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
                    <Link
                        key={page}
                        href={createPageUrl(page)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                            page === currentPage
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </Link>
                ))}
            </>
        );
    };

    const navigationButton = (page: number, Icon: typeof HiChevronLeft, label: string) => (
        <Link
            href={createPageUrl(page)}
            className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label={label}
        >
            <Icon className="w-5 h-5" aria-hidden="true" />
        </Link>
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

Pagination.displayName = 'Pagination';

export default Pagination;