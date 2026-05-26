import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User, Anime, Genre, Episode } from '@/models';
import { isFullAdmin, canManageContent, canDeleteContent } from '@/lib/admin-permissions';
import { logToDiscordWebhook, notifyNewAnime } from '@/lib/discord-webhook';
import { validateAnimeData } from '@/lib/anime-validation';
import { importLogger, ImportLogger } from '@/lib/import-logger';
import { submitAnimeToIndexNow } from '@/lib/indexnow';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminRaw = await User.findOne({ clerkId: userId }).lean();
  let admin: { roles?: string[] } | null = null;
  if (adminRaw && typeof adminRaw === 'object' && !Array.isArray(adminRaw)) {
    admin = adminRaw as { roles?: string[] };
  }
  if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();
  const operation = data.malId ? 'mal_import' : 'manual_add';
  
  // Validate anime data using middleware
const validationResult = validateAnimeData(data);

if (validationResult.errors.length > 0) {
  await logToDiscordWebhook(`Anime validation failed: ${validationResult.errors}`);
  
  // Log validation failure
  await importLogger.logImportFailure({
    malId: data.malId,
    animeTitle: data.name || 'Unknown', 
    userId,
    errorMessage: 'Validation failed',
    validationErrors: validationResult.errors,
    duration: Date.now() - startTime,
    operation
  });
  
  return NextResponse.json({ 
    error: 'Validation failed', 
    details: validationResult.errors 
  }, { status: 400 });
}

// Log warnings if any
if (validationResult.warnings.length > 0) {
  await (async () => {
    console.warn('Anime validation warnings:', validationResult.warnings);
  })();
}

// Use sanitized data from validation 
const sanitizedData = validationResult.sanitizedData;
// Map front-end malId to schema field malid
const { malId, ...restSanitized } = sanitizedData;
  // Optionally, handle genres as array of names or IDs
  let genreIds = [];
  if (Array.isArray(sanitizedData.genres)) {
    genreIds = await Promise.all(sanitizedData.genres.map(async (g: any) => {
      if (typeof g === 'string') {
        const normalized = g.trim().toLowerCase();
        if (!normalized) return null;
        let genre = await Genre.findOne({ name: new RegExp(`^${normalized}$`, 'i') });
        if (!genre) genre = await Genre.create({ name: normalized });
        return genre._id;
      } else if (g && g._id) {
        return g._id;
      }
      return null;
    }));
    // Filter out null/invalid genres
    const before = genreIds.length;
    genreIds = genreIds.filter(Boolean);
    if (genreIds.length !== before) {
      console.warn('Some genres were missing or invalid and were filtered out:', sanitizedData.genres);
    }
  }
  const anime = await Anime.create({
    ...restSanitized,
    ...(typeof malId === 'number' ? { malid: malId } : {}),
    genres: genreIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // Populate genres for webhook notification
  await anime.populate('genres');
  
  // Send Discord webhook notification
  try {
    const user = await User.findOne({ clerkId: userId }).lean();
    const addedBy = (user as any)?.username || (user as any)?.email || 'Unknown User';
    
    await notifyNewAnime({
      title: anime.name,
      synopsis: anime.description,
      poster: anime.poster,
      studio: anime.studio,
      genres: anime.genres,
      alternativeTitles: anime.alternativeTitles,
      animeId: anime._id.toString(),
    }, addedBy);
  } catch (error) {
    await logToDiscordWebhook(`Failed to send Discord webhook for new anime: ${error}`);
    // Don't fail the request if webhook fails
  }
  
  // Assess data quality for logging
  const dataQuality = ImportLogger.assessDataQuality(anime);
  
  // Log successful import
  if (validationResult.warnings.length > 0) {
    await importLogger.logImportWarning({
      malId: data.malId,
      animeTitle: anime.name,
      userId,
      warningMessage: `Import completed with warnings: ${validationResult.warnings.join(', ')}`,
      dataQuality,
      duration: Date.now() - startTime,
      operation
    });
  } else {
    await importLogger.logImportSuccess({
      malId: data.malId,
      animeTitle: anime.name,
      userId,
      dataQuality,
      duration: Date.now() - startTime,
      operation
    });
  }

  // Submit to IndexNow for immediate search engine indexing
  try {
    await submitAnimeToIndexNow(anime._id.toString(), anime.name);
  } catch (error) {
    await logToDiscordWebhook(`Failed to submit new anime to IndexNow: ${error}`);
    // Don't fail the request if IndexNow submission fails
  }

  // Invalidate cache to show new anime immediately

  return NextResponse.json({ anime });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminRaw = await User.findOne({ clerkId: userId }).lean();
  let admin: { roles?: string[] } | null = null;
  if (adminRaw && typeof adminRaw === 'object' && !Array.isArray(adminRaw)) {
    admin = adminRaw as { roles?: string[] };
  }
  if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { animeId, ...update } = await req.json();
  if (!animeId) return NextResponse.json({ error: 'Missing animeId' }, { status: 400 });
  
  // Validate anime update data using middleware
  const validationResult = await validateAnimeData(update, true); // true for partial update
  
  if (validationResult.errors.length > 0) {
    await logToDiscordWebhook(`Anime update validation failed: ${validationResult.errors}`);
    return NextResponse.json({ 
      error: 'Validation failed', 
      details: validationResult.errors 
    }, { status: 400 });
  }
  
  // Log warnings if any
  if (validationResult.warnings.length > 0) {
    await logToDiscordWebhook(`Anime update validation warnings: ${validationResult.warnings}`);
  }
  
  // Use sanitized data from validation
  const sanitizedUpdate = validationResult.sanitizedData;
  // Map malId to malid for updates as well
  if (typeof sanitizedUpdate.malId === 'number') {
    sanitizedUpdate.malid = sanitizedUpdate.malId;
    delete sanitizedUpdate.malId;
  }
  
  // Robust normalization for genres
  if (Array.isArray(sanitizedUpdate.genres)) {
    sanitizedUpdate.genres = await Promise.all(sanitizedUpdate.genres.map(async (g: any) => {
      if (typeof g === 'string') {
        const normalized = g.trim().toLowerCase();
        if (!normalized) return null;
        let genre = await Genre.findOne({ name: new RegExp(`^${normalized}$`, 'i') });
        if (!genre) genre = await Genre.create({ name: normalized });
        return genre._id;
      } else if (g && g._id) {
        return g._id;
      } else if (g && typeof g === 'object' && g.name) {
        // Defensive: handle {name: ...}
        const normalized = g.name.trim().toLowerCase();
        if (!normalized) return null;
        let genre = await Genre.findOne({ name: new RegExp(`^${normalized}$`, 'i') });
        if (!genre) genre = await Genre.create({ name: normalized });
        return genre._id;
      } else if (g && typeof g === 'object' && g.toString) {
        // Defensive: handle ObjectId
        return g;
      }
      return null;
    }));
    // Filter out null/invalid genres
    const before = sanitizedUpdate.genres.length;
    sanitizedUpdate.genres = sanitizedUpdate.genres.filter(Boolean);
    if (sanitizedUpdate.genres.length !== before) {
      console.warn('Some genres were missing or invalid and were filtered out:', sanitizedUpdate.genres);
      await logToDiscordWebhook(`Some genres were missing or invalid and were filtered out: ${sanitizedUpdate.genres}`);
      
    }
  }
  sanitizedUpdate.updatedAt = new Date();
  const anime = await Anime.findByIdAndUpdate(animeId, sanitizedUpdate, { new: true });
  if (!anime) return NextResponse.json({ error: 'Anime not found' }, { status: 404 });

  // Always update all episodes to match the anime's genres (even if empty)
  const result = await Episode.updateMany(
    { animeId: anime._id },
    { $set: { genres: anime.genres } }
  );
  console.log(`[PATCH /api/admin/anime] Updated genres for ${result.modifiedCount} episodes of anime ${anime._id}`);

  // Submit to IndexNow for immediate search engine indexing
  try {
    await submitAnimeToIndexNow(anime._id.toString(), anime.name);
  } catch (error) {
    await logToDiscordWebhook(`Failed to submit updated anime to IndexNow: ${error}`);
    // Don't fail the request if IndexNow submission fails
  }

  // Invalidate cache to reflect anime updates immediately

  return NextResponse.json({ anime });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminRaw = await User.findOne({ clerkId: userId }).lean();
  let admin: { roles?: string[] } | null = null;
  if (adminRaw && typeof adminRaw === 'object' && !Array.isArray(adminRaw)) {
    admin = adminRaw as { roles?: string[] };
  }
  if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = Math.max(1, Math.min(100, parseInt(url.searchParams.get('perPage') || '10', 10)));
  const search = url.searchParams.get('search') || '';

  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { alternativeTitles: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Anime.countDocuments(query);
  const animes = await Anime.find(query)
    .populate('genres', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .lean();

  return NextResponse.json({
    animes,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminRaw = await User.findOne({ clerkId: userId }).lean();
  let admin: { roles?: string[] } | null = null;
  if (adminRaw && typeof adminRaw === 'object' && !Array.isArray(adminRaw)) {
    admin = adminRaw as { roles?: string[] };
  }
  if (!admin || !canDeleteContent(admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { animeId } = await req.json();
  if (!animeId) return NextResponse.json({ error: 'Missing animeId' }, { status: 400 });

  const anime = await Anime.findByIdAndDelete(animeId);
  if (!anime) return NextResponse.json({ error: 'Anime not found' }, { status: 404 });

  // Invalidate cache to reflect anime deletion immediately


  return NextResponse.json({ success: true, message: 'Anime deleted.' });
}