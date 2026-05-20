// lib/indexnow.ts
import { logToDiscordWebhook } from './discord-webhook';

// IndexNow configuration
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiTerra.ro';

// Search engine endpoints that support IndexNow
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow', // Microsoft Bing
  'https://www.bing.com/indexnow',     // Bing direct
  // Note: Google doesn't support IndexNow yet, but we keep the structure ready
];

interface IndexNowSubmission {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Submit URLs to IndexNow for immediate indexing
 * @param urls - Array of URLs to submit
 * @param reason - Reason for submission (for logging)
 */
export async function submitToIndexNow(urls: string[], reason: string = 'Content update'): Promise<boolean> {
  if (!urls || urls.length === 0) {
    console.warn('No URLs provided for IndexNow submission');
    return false;
  }

  // Ensure URLs are absolute
  const absoluteUrls = urls.map(url => {
    if (url.startsWith('/')) {
      return `${SITE_URL}${url}`;
    }
    return url;
  });

  const submission: IndexNowSubmission = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: absoluteUrls
  };

  let successCount = 0;
  const errors: string[] = [];

  // Submit to each search engine endpoint
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HentaiTerra IndexNow Bot'
        },
        body: JSON.stringify(submission)
      });

      if (response.ok || response.status === 202) {
        successCount++;
        console.log(`IndexNow submission successful to ${endpoint}:`, {
          status: response.status,
          urls: absoluteUrls,
          reason
        });
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        errors.push(`${endpoint}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Log results
  if (successCount > 0) {
    await logToDiscordWebhook(
      `✅ IndexNow: Successfully submitted ${absoluteUrls.length} URLs to ${successCount}/${INDEXNOW_ENDPOINTS.length} search engines. Reason: ${reason}\nURLs: ${absoluteUrls.join(', ')}`
    );
  }

  if (errors.length > 0) {
    await logToDiscordWebhook(
      `⚠️ IndexNow: Some submissions failed:\n${errors.join('\n')}`
    );
  }

  return successCount > 0;
}

/**
 * Submit a single URL to IndexNow
 * @param url - URL to submit
 * @param reason - Reason for submission
 */
export async function submitUrlToIndexNow(url: string, reason: string = 'Content update'): Promise<boolean> {
  return submitToIndexNow([url], reason);
}

/**
 * Submit anime page URL to IndexNow
 * @param animeId - Anime ID
 * @param animeName - Anime name for logging
 */
export async function submitAnimeToIndexNow(animeId: string, animeName: string): Promise<boolean> {
  const url = `/hentai/${animeId}`;
  return submitUrlToIndexNow(url, `New/Updated hentai: ${animeName}`);
}

/**
 * Submit episode page URL to IndexNow
 * @param animeId - Anime ID
 * @param episodeId - Episode ID
 * @param episodeName - Episode name for logging
 */
export async function submitEpisodeToIndexNow(animeId: string, episodeId: string, episodeName: string): Promise<boolean> {
  const url = `/watch/${episodeId}`;
  return submitUrlToIndexNow(url, `New/Updated episode: ${episodeName}`);
}

/**
 * Submit multiple anime URLs to IndexNow
 * @param animeData - Array of anime data with id and name
 */
export async function submitMultipleAnimeToIndexNow(animeData: Array<{ id: string; name: string }>): Promise<boolean> {
  const urls = animeData.map(anime => `/hentai/${anime.id}`);
  const names = animeData.map(anime => anime.name).join(', ');
  return submitToIndexNow(urls, `Bulk hentai update: ${names}`);
}

/**
 * Submit multiple episode URLs to IndexNow
 * @param episodeData - Array of episode data with animeId, episodeId, and name
 */
export async function submitMultipleEpisodesToIndexNow(
  episodeData: Array<{ animeId: string; episodeId: string; name: string }>
): Promise<boolean> {
  const urls = episodeData.map(episode => `/watch/${episode.animeId}/${episode.episodeId}`);
  const names = episodeData.map(episode => episode.name).join(', ');
  return submitToIndexNow(urls, `Bulk episode update: ${names}`);
}

/**
 * Submit homepage and main pages to IndexNow
 */
export async function submitMainPagesToIndexNow(): Promise<boolean> {
  const mainPages = [
    '/',
    '/hentai',
    '/movies',
    '/filter'
  ];
  return submitToIndexNow(mainPages, 'Main pages update');
}
