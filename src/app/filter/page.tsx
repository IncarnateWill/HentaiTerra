import { getFilteredMedia, getGenres } from "@/lib/db-utils";
import FilterOptions from "@/components/filter/filter-options";
import MediaGrid from "@/components/ui/media-grid-anime";
import Pagination from "@/components/ui/pagination";
import { Metadata } from 'next';
import { logToDiscordWebhook } from "@/lib/discord-webhook";

export const metadata: Metadata = {
  title: `Filtrează Hentai | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'} - Caută după Gen și Popularitate`,
  description: `Descoperă hentai-uri noi folosind filtrele avansate pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}. Caută după gen, popularitate, anul lansării și multe altele pentru a găsi hentai-ul perfect.`,
  alternates: {
    canonical: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/filter`
  },
  openGraph: {
    title: `Filtrează Hentai | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Descoperă hentai-uri noi folosind filtrele avansate. Caută după gen, popularitate și multe altele.`,
    url: `${process.env.SITE_URL || 'https://hentaiterra.ro'}/filter`,
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function FilterPage({ searchParams }: any) {
    const { page, genres, sort, q } =  await searchParams;
    const genreList = genres?.split(',').filter(Boolean) || [];
    const sortOption = sort || 'latest';
    const searchQuery = q || '';

    try {
        const [allGenres, { media, totalPages, totalCount }] = await Promise.all([
            getGenres(),
            getFilteredMedia({
                page: Math.max(1, Number(page) || 1),
                perPage: 18,
                search: searchQuery,
                genres: genreList,
                sort: sortOption,
            })
        ]);

        const serializedData = {
            genres: allGenres.map((genre: any) => ({
                _id: String(genre._id),
                name: genre.name,
            })),
            animes: media.map((anime: { _id: string | number; name: string; title?: string; poster: string; views: number; censorship?: 'censored' | 'uncensored' }) => ({
                id: (anime._id as string).toString(),
                title: anime.title || anime.name,
                posterPath: anime.poster,
                mediaType: "anime" as const,
                views: anime.views,
                name: anime.name || anime.title,
                censorship: (anime.censorship || 'censored') as 'censored' | 'uncensored'
            }))
        };

        const cleanSearchParams = Object.fromEntries(
            Object.entries({ q, genres, sort })
                .filter(([_, value]) => Boolean(value))
        );

        return (
            <div className="container mx-auto py-8">
                <FilterOptions
                    allGenres={serializedData.genres}
                    selectedGenres={genreList}
                    currentSort={sortOption}
                    searchQuery={searchQuery}
                />

                <div className="mt-6 mb-4">
                    <h2 className="text-xl font-semibold">
                        {totalCount > 0
                            ? `Am găsit ${totalCount} rezultat${totalCount === 1 ? '' : 'e'}`
                            : 'Nu au fost găsite hentai-uri'}
                    </h2>
                </div>

                {totalCount > 0 ? (
                    <>
                        <MediaGrid items={serializedData.animes} />
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={Math.max(1, Math.min(Number(page) || 1, totalPages))}
                                totalPages={totalPages}
                                baseUrl="/filter"
                                searchParams={cleanSearchParams}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        Încearcă alte filtre sau termeni de căutare
                    </div>
                )}
            </div>
        );
    } catch (error) {
        await logToDiscordWebhook(`Filter page error: ${error}`);
        return (
            <div className="container mx-auto py-8 text-center text-red-500">
                Eroare la încărcarea rezultatelor. Încearcă din nou.
            </div>
        );
    }
}
