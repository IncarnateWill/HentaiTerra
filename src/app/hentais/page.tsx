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
            alt: `${anime.title || ''} - Vizionează pe HentaiTerra`,
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
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20"></div>
                    <div className="container mx-auto py-8 sm:py-16 px-4 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-primary-300 via-text-primary to-primary-300 bg-clip-text text-transparent leading-tight">
                                Hentai Online Subtitrat în Română
                            </h1>
                            <p className="text-lg sm:text-xl text-text-secondary mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
                                  Descoperă cea mai mare colecție de hentai subtitrat în română. Streaming gratuit, 
                                  calitate HD și actualizări zilnice cu cele mai noi episoade și serii hentai.
                              </p>
                              <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto">
                                Descoperă cea mai mare colecție de hentai subtitrat în română. Streaming gratuit, 
                                calitate HD și actualizări zilnice cu cele mai noi episoade și serii hentai.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-full border border-primary-500/30">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-text-secondary font-medium">
                                    {totalCount.toLocaleString()} hentai disponibile
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <main className="container mx-auto py-8 px-4">
                    <div className="bg-gradient-to-br from-background-tertiary/50 to-background-secondary/50 backdrop-blur-sm border border-primary-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
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
            <main className="container mx-auto py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-primary-500/30 shadow-xl p-4 sm:p-8 md:p-12 w-full text-center">
                        <div className="w-16 h-16 bg-semantic-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-semantic-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
                             Oops! Ceva nu a mers bine
                         </h2>
                        <p className="text-lg text-text-secondary mb-6">
                            A apărut o eroare la încărcarea rezultatelor pe HentaiTerra. Te rugăm să încerci din nou.
                        </p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="inline-flex items-center px-6 py-3 bg-semantic-error hover:bg-red-700 text-text-primary font-semibold rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
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
