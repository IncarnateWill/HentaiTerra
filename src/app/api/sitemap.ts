import type { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Anime, Episode } from '@/models';
import { logToDiscordWebhook } from '@/lib/discord-webhook';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Reusable connection
const dbConnection = connectToDatabase().catch(async (error) => {
  await logToDiscordWebhook(`Error in sitemap: ${error}`);
});

// Constants
const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiUnited.ro') as string;
const DEFAULT_LAST_MODIFIED = new Date();
const BATCH_SIZE = 1000; // For pagination

// Types
type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

/**
 * Generate the sitemap for the entire application
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Ensure database connection
    await dbConnection;

    // Get total counts for pagination
    const [animeCount, episodeCount] = await Promise.all([
      Anime.countDocuments(),
      Episode.countDocuments(),
    ]);

    console.log(`Generating sitemap for ${animeCount} animes, ${episodeCount} episodes`);

    // Fetch data in batches
    const fetchBatch = async <T>(
      model: any,
      fields: string,
      skip: number,
      filter = {}
    ): Promise<T[]> => {
      return model.find(filter, fields)
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();
    };

    // Define static pages
    const staticPages: SitemapEntry[] = [
      { url: SITE_URL as string, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'daily', priority: 1.0 },
      { url: `${SITE_URL}/home`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'daily', priority: 1.0 },
      { url: `${SITE_URL}/hentais`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/movies`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/donate`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.6 },
      { url: `${SITE_URL}/about`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.6 },
      { url: `${SITE_URL}/contact`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
      { url: `${SITE_URL}/recruit`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
      { url: `${SITE_URL}/dmca`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.4 },
      { url: `${SITE_URL}/staff`, lastModified: DEFAULT_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    ];

    // Collect all entries
    const sitemapEntries: SitemapEntry[] = [...staticPages];

    // Process animes in batches
    for (let skip = 0; skip < animeCount; skip += BATCH_SIZE) {
      const animeBatch = await fetchBatch<{ _id: string; updatedAt: Date }>(
        Anime,
        '_id updatedAt',
        skip
      );
      
      const hentaiPages = animeBatch.map(anime => ({
        url: `${SITE_URL}/hentai/${anime._id}`,
        lastModified: anime.updatedAt || DEFAULT_LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
      
      sitemapEntries.push(...hentaiPages);
    }

    // Process episodes in batches
    for (let skip = 0; skip < episodeCount; skip += BATCH_SIZE) {
      const episodeBatch = await fetchBatch<{ episodeId: string; updateDate: Date }>(
        Episode,
        'episodeId updateDate',
        skip
      );
      
      const episodePages = episodeBatch.map(episode => ({
        url: `${SITE_URL}/watch/${episode.episodeId}`,
        lastModified: episode.updateDate || DEFAULT_LAST_MODIFIED,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
      
      sitemapEntries.push(...episodePages);
    }

    console.log(`Generated sitemap with ${sitemapEntries.length} URLs`);
    
    // Return the sitemap in the format Next.js expects
    return sitemapEntries;
  } catch (error) {
    await logToDiscordWebhook(`Error generating sitemap: ${error}`);
    return [
      {
        url: SITE_URL as string,
        lastModified: DEFAULT_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ];
  }
}
