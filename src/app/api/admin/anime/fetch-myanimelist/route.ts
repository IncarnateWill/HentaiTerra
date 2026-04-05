import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { isFullAdmin, canManageContent } from '@/lib/admin-permissions';
import { logToDiscordWebhook } from '@/lib/discord-webhook';

const JIKAN_BASE = process.env.JIKAN_BASE || 'https://api.jikan.moe/v4';

async function translateText(text: string): Promise<string> {
  if (!text || typeof text !== 'string') return 'Nu există text de tradus';
  if (text.length > 5000) return 'Textul este prea lung pentru a fi tradus';
  
  text = text.trim().replace(/\s+/g, ' ');
  if (text === '') return 'Text gol';

  console.log('Translating to Romanian:', text.substring(0, 100) + '...');

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ro&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    });

    if (!res.ok) {
      console.warn('Translation failed:', res.status);
      return text;
    }

    const data = await res.json();

    // Google Translate response format: [[["translated","original",...], ...], ...]
    let translatedText = '';
    
    if (Array.isArray(data) && Array.isArray(data[0])) {
      for (const segment of data[0]) {
        if (Array.isArray(segment) && typeof segment[0] === 'string') {
          translatedText += segment[0];
        }
      }
    }

    const result = translatedText.trim();
    console.log('Translation result:', result.substring(0, 100) + '...');
    
    return result || text;
  } catch (err) {
    console.error('Translation error:', err);
    await logToDiscordWebhook(`Translation error (Google Translate API): ${err}`);
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const adminRaw = await User.findOne({ clerkId: userId }).lean();
    let admin: { roles?: string[] } | null = null;
    if (adminRaw && typeof adminRaw === 'object' && !Array.isArray(adminRaw)) {
      const raw = adminRaw as { role?: string; roles?: string[] };
      admin = { roles: Array.isArray(raw.roles) && raw.roles.length > 0 ? raw.roles : (raw.role ? [raw.role] : []) };
    }
    if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let searchTerm: string | undefined, malId: string | undefined;
    try {
      const body = await req.json();
      searchTerm = body.searchTerm;
      malId = body.malId;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!searchTerm && !malId) return NextResponse.json({ error: 'Missing searchTerm or malId' }, { status: 400 });

    if (searchTerm) {
      try {
        const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(searchTerm)}&limit=10`);
        if (!res.ok) {
          const text = await res.text();
          console.error('Jikan search error:', text);
          return NextResponse.json({ error: 'Failed to fetch from Jikan' }, { status: 500 });
        }
        const data = await res.json();
        return NextResponse.json({ results: data.data });
      } catch (err) {
        console.error('Jikan search fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch from Jikan' }, { status: 500 });
      }
    }

    if (malId) {
      try {
        const res = await fetch(`${JIKAN_BASE}/anime/${malId}/full`);
        if (!res.ok) {
          const text = await res.text();
          console.error('Jikan anime details error:', text);
          return NextResponse.json({ error: 'Failed to fetch anime details' }, { status: 500 });
        }
        const data = await res.json();
        const anime = data.data;
        
        // Main title is always the original title
        const title = anime.title;
        
        // Translate title to Romanian for alternative titles
        let translatedTitle = '';
        try {
          const result = await translateText(anime.title);
          if (result && result !== anime.title) {
            translatedTitle = result;
          }
        } catch (err) {
          console.error('Title translation failed:', err);
        }
        
        // Build alternative titles array
        const alternativeTitles: string[] = [];
        
        // Add translated Romanian title first (if available and different)
        if (translatedTitle && translatedTitle !== title) {
          alternativeTitles.push(translatedTitle);
        }
        
        // Add English title (if available and different from main title)
        if (anime.title_english && anime.title_english !== title) {
          alternativeTitles.push(anime.title_english);
        }
        
        // Add Japanese title (if available and different from main title)
        if (anime.title_japanese && anime.title_japanese !== title) {
          alternativeTitles.push(anime.title_japanese);
        }
        
        // Add synonyms (if available)
        if (Array.isArray(anime.title_synonyms) && anime.title_synonyms.length > 0) {
          anime.title_synonyms.forEach((synonym: string) => {
            if (synonym && synonym !== title && !alternativeTitles.includes(synonym)) {
              alternativeTitles.push(synonym);
            }
          });
        }
        
        // Translate synopsis
        let synopsis = anime.synopsis || 'Nu există descriere disponibilă';
        try {
          if (anime.synopsis) {
            const translatedSynopsis = await translateText(anime.synopsis);
            if (translatedSynopsis && translatedSynopsis !== anime.synopsis) {
              synopsis = translatedSynopsis;
            }
          }
        } catch (err) {
          console.error('Synopsis translation failed:', err);
          synopsis = anime.synopsis || 'Nu există descriere disponibilă';
        }
        
        // Derive suggested censorship from rating/titles
        const textPool = [
          anime.title,
          anime.title_english,
          anime.title_japanese,
          ...(Array.isArray(anime.title_synonyms) ? anime.title_synonyms : [])
        ].filter(Boolean).join(' | ');
        const isUnc = /uncensored|un\s*censored|necenzurat|uncen/i.test(textPool);
        const suggestedCensorship = isUnc ? 'uncensored' : 'censored';

        return NextResponse.json({
          anime: {
            malId: anime.mal_id,
            title,
            alternativeTitles,
            synopsis,
            poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
            genres: anime.genres,
            year: anime.year,
            episodes: anime.episodes,
            status: anime.status,
            type: anime.type,
            source: anime.source,
            rating: anime.rating,
            aired: anime.aired,
            duration: anime.duration,
            studios: anime.studios,
            suggestedCensorship,
            original: {
              title: anime.title,
              synopsis: anime.synopsis,
            },
          }
        });
      } catch (err) {
        console.error('Jikan anime details fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch anime details' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (err) {
    console.error('Unexpected error in fetch-myanimelist:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}