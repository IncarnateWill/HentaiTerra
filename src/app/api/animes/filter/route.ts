import { NextRequest, NextResponse } from 'next/server';
import { getFilteredMedia } from '@/lib/db-utils';
import { logToDiscordWebhook } from '@/lib/discord-webhook';
import { getCachedData, setCachedData } from '@/lib/redis';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('perPage') || '18');
        const search = searchParams.get('search') || '';
        const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
        const sort = searchParams.get('sort') || 'latest';

        const cacheKey = `filter_${page}_${perPage}_${search}_${genres.join(',')}_${sort}`;
        const cachedResult = await getCachedData<any>(cacheKey);

        if (cachedResult) {
            return NextResponse.json(cachedResult);
        }

        const result = await getFilteredMedia({
            page,
            perPage,
            search,
            genres,
            sort: sort === "alphabetical" ? "title" : sort,
        });

        // Transform the data for client consumption
        const serializedResult = {
            ...result,
            media: result.media?.map((anime: any) => ({
                id: String(anime._id),
                title: anime.title || '',
                posterPath: anime.poster || '',
                mediaType: "anime" as const,
                views: typeof anime.views === 'number' ? anime.views : 0,
                alt: `${anime.title || ''} - Vizionează pe HentaiTerra`,
                name: anime.name || '',
                censorship: (anime.censorship || 'censored') as 'censored' | 'uncensored'
            })) || []
        };

        await setCachedData(cacheKey, serializedResult, 300); // Cache for 5 minutes

        return NextResponse.json(serializedResult);
    } catch (error) {
        await logToDiscordWebhook(`Filter API error: ${error}`);
        return NextResponse.json(
            { error: 'Failed to fetch filtered hentai data' },
            { status: 500 }
        );
    }
}
