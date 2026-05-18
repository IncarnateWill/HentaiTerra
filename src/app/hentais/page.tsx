import { getFilteredMedia, getGenres } from "@/lib/db-utils";
import ClientFilterWrapper from "@/components/filter/client-filter-wrapper";
import Script from "next/script";
import { animesmetadata } from "@/config/animesmetadata";
import { animesstructuredata } from "@/config/animesstructured-data";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

export const dynamic = "force-dynamic";

// Caching disabled for Cloudflare conflict diagnosis
// export const revalidate = 60; // 5 minutes in seconds

export const metadata = animesmetadata;

// Types for better type safety
// Update the interface and parameter type
interface SearchParams {
    page?: string;
    genres?: string;
    sort?: string;
    q?: string;
}

interface AnimeData {
    _id: string;
    title: string;
    poster: string;
    views: number;
    name: string;
    censorship?: 'censored' | 'uncensored';
}

const FilterPage = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
    try {
        // For clean URLs, we'll use default values and let client-side handle filters
        const params = await searchParams;
        const { page } = params; // Only use page from URL if present
        const genreList: string[] = [];
        const sortOption = 'latest';
        const searchQuery = '';
        const currentPage = Math.max(1, Number(page) || 1);

        // Fetch initial data for server-side rendering
        const [allGenres, { media, totalPages, totalCount }] = await Promise.all([
            getGenres(),
            getFilteredMedia({
                page: currentPage,
                perPage: 18,
                search: searchQuery,
                genres: genreList,
                sort: sortOption,
            })
        ]);

        // Optimize data transformation
        const serializedGenres = allGenres.map((genre: any) => ({
            _id: String(genre._id),
            name: genre.name,
        }));

        const serializedAnimes = media?.map((anime: AnimeData) => ({
            id: String(anime._id),
            title: anime.title || '',
            posterPath: anime.poster || '',
            mediaType: "anime" as const,
            views: typeof anime.views === 'number' ? anime.views : 0,
            alt: `${anime.title || ''} - Vizionează pe HentaiUnited`,
            name: anime.name || '',
            censorship: (anime.censorship || 'censored') as 'censored' | 'uncensored'
        })) || [];

        return (
            <>
                <Script
                    id="animes-structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(animesstructuredata())
                    }}
                    strategy="afterInteractive"
                />

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-8 sm:pt-20 sm:pb-16">
                    {/* Background Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
                    <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-secondary-600/10 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
                    
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center max-w-4xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-400/50 backdrop-blur-md rounded-full border border-white/5 shadow-xl">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                                <span className="text-sm text-gray-300 font-medium">
                                    {totalCount.toLocaleString()} serii disponibile
                                </span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 tracking-tight text-white drop-shadow-lg">
                                Hentai Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Subtitrat</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium">
                                Descoperă cea mai mare colecție de hentai subtitrat în română. Streaming gratuit,
                                calitate HD și actualizări zilnice.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <main className="container mx-auto pb-16 px-4 relative z-10">
                    <div className="bg-dark-400/30 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/5">
                        <ClientFilterWrapper
                            initialGenres={serializedGenres}
                            initialAnimes={serializedAnimes}
                            initialTotalPages={totalPages}
                            initialTotalCount={totalCount}
                        />
                    </div>
                </main>
            </>
        );
    } catch (error) {
        await logToDiscordWebhook(`Error in FilterPage: ${error}`);
        return (
            <main className="container mx-auto py-24 px-4 min-h-[60vh] flex items-center justify-center">
                <div className="max-w-md w-full mx-auto text-center">
                    <div className="rounded-3xl bg-dark-400/30 backdrop-blur-xl border border-white/5 shadow-2xl p-8 sm:p-10 w-full text-center relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-[50px] pointer-events-none"></div>
                        
                        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 rotate-3 shadow-lg">
                            <svg className="w-10 h-10 text-red-400 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                            Oops! Ceva nu a mers
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            A apărut o eroare la încărcarea rezultatelor pe HentaiUnited. Te rugăm să încerci din nou.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5"
                        >
                            Încearcă din nou
                        </button>
                    </div>
                </div>
            </main>
        );
    }
};

export default FilterPage;
