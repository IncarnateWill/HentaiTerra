import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { User, Episode, Anime, Genre } from '@/models';
import { isFullAdmin, canManageContent, canDeleteContent } from '@/lib/admin-permissions';
import { notifyNewEpisode } from '@/lib/discord-webhook';
import { submitEpisodeToIndexNow } from '@/lib/indexnow';

// Helper function to get admin user with roles
async function getAdminUser(userId: string) {
  if (!userId) return null;
  
  const adminRaw = await User.findOne({ clerkId: userId }).lean();
  if (!adminRaw || typeof adminRaw !== 'object' || Array.isArray(adminRaw)) {
    return null;
  }

  // Support both legacy role and new roles array
  const roles = Array.isArray((adminRaw as any).roles) && (adminRaw as any).roles.length > 0
    ? (adminRaw as any).roles
    : (adminRaw as any).role ? [(adminRaw as any).role] : ['user'];
    
  return { ...adminRaw, roles };
}

// Helper function to clean episode data
function cleanEpisodeData(data: any) {
  const cleanedData = { ...data };
  
  // Remove sensitive/computed fields
  delete cleanedData.genres;
  delete cleanedData._id;
  delete cleanedData.episodeId;
  
  // Clean up empty backup URLs
  if (cleanedData.videoUrlBackup === '') delete cleanedData.videoUrlBackup;
  if (cleanedData.videoUrlBackup2 === '') delete cleanedData.videoUrlBackup2;
  if (cleanedData.videoUrlBackup3 === '') delete cleanedData.videoUrlBackup3;
  
  return cleanedData;
}

// Helper function to sync episode genres with anime
async function syncEpisodeGenres(episode: any) {
  if (!episode.animeId) return episode;
  
  try {
    const anime = await Anime.findById(episode.animeId).select('genres');
    if (anime && Array.isArray(anime.genres)) {
      episode.genres = anime.genres;
      await episode.save();
    }
  } catch (error) {
    console.error('Error syncing episode genres:', error);
  }
  
  return episode;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = userId ? await getAdminUser(userId) : null;
    
    if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const cleanedData = cleanEpisodeData(data);
    
    // Generate episodeId before creation
    const epid = new mongoose.Types.ObjectId().toString();
    
    // Always set releaseDate to current date
    const now = new Date().toISOString();
    const episodeData = {
      ...cleanedData,
      episodeId: epid,
      releaseDate: now,
      createdAt: now,
      updateDate: now,
    };

    // Create episode
    const episode = await Episode.create(episodeData);
    
    // Sync genres with anime and add episode to anime's episodes array
    await Promise.all([
      syncEpisodeGenres(episode),
      data.animeId ? Anime.findByIdAndUpdate(data.animeId, { 
        $addToSet: { episodes: episode._id } 
      }) : Promise.resolve()
    ]);
    
    // Send Discord webhook notification (don't await to avoid blocking)
    if (data.animeId) {
      // Get anime details first, then send webhook once
      (async () => {
        try {
          const animeDetails = await Anime.findById(data.animeId).select('name poster').lean();
          await notifyNewEpisode({
            name: episode.name,
            episodeNumber: episode.episodeNumber,
            thumbnail: episode.thumbnail,
            anime: animeDetails ? {
              title: (animeDetails as any).name,
              poster: (animeDetails as any).poster,
            } : undefined
          }, (admin as any)?.username || (admin as any)?.email || 'Unknown User');
        } catch (error) {
          console.error('Failed to send Discord webhook for new episode:', error);
        }
      })();
    }

    // Submit to IndexNow for immediate search engine indexing
    if (data.animeId) {
      try {
        await submitEpisodeToIndexNow(
          data.animeId.toString(), 
          episode.episodeId, 
          `${episode.name} - Episode ${episode.episodeNumber}`
        );
      } catch (error) {
        console.error('Failed to submit new episode to IndexNow:', error);
        // Don't fail the request if IndexNow submission fails
      }
    }
    
    return NextResponse.json({ episode });
    
  } catch (error) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = userId ? await getAdminUser(userId) : null;
    
    if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { episodeId, _id, ...updateData } = body;
    
    if (!episodeId && !_id) {
      return NextResponse.json(
        { error: 'Either episodeId or _id is required' }, 
        { status: 400 }
      );
    }
    
    // Clean update data and preserve immutable fields
    const cleanedUpdate = cleanEpisodeData(updateData);
    delete cleanedUpdate.animeId;
    delete cleanedUpdate.releaseDate;
    delete cleanedUpdate.views;
    delete cleanedUpdate.likes;
    delete cleanedUpdate.dislikes;
    delete cleanedUpdate.createdAt;
    
    // Update timestamp
    cleanedUpdate.updateDate = new Date().toISOString();
    
    // Find and update episode
    let episode = null;
    if (_id) {
      episode = await Episode.findByIdAndUpdate(_id, cleanedUpdate, { new: true });
    } else if (episodeId) {
      episode = await Episode.findOneAndUpdate({ episodeId }, cleanedUpdate, { new: true });
    }
    
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    
    // Sync genres with anime
    await syncEpisodeGenres(episode);

    // Submit to IndexNow for immediate search engine indexing
    if (episode.animeId) {
      try {
        await submitEpisodeToIndexNow(
          episode.animeId.toString(), 
          episode.episodeId, 
          `${episode.name} - Episode ${episode.episodeNumber}`
        );
      } catch (error) {
        console.error('Failed to submit updated episode to IndexNow:', error);
        // Don't fail the request if IndexNow submission fails
      }
    }
    
    return NextResponse.json({ episode });
    
  } catch (error) {
    console.error('Error updating episode:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = userId ? await getAdminUser(userId) : null;
    
    if (!admin || (!isFullAdmin(admin) && !canManageContent(admin))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const animeId = url.searchParams.get('animeId');
    const search = url.searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const perPage = Math.max(1, Math.min(100, parseInt(url.searchParams.get('perPage') || '20', 10)));

    // Build query
    const query: any = {};
    if (animeId) {
      query.animeId = animeId;
    }
    
    if (search) {
      const searchConditions: any[] = [
        { name: { $regex: search, $options: 'i' } },
        { displayTitle: { $regex: search, $options: 'i' } }
      ];
      
      // Handle numeric search for episode numbers
      const searchNum = parseInt(search, 10);
      if (!isNaN(searchNum)) {
        searchConditions.push({ episodeNumber: searchNum });
      } else {
        // String search in episode numbers
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$episodeNumber" }, 
              regex: search, 
              options: "i" 
            } 
          } 
        });
      }
      
      query.$or = searchConditions;
    }

    // Execute queries in parallel
    const [episodes, total] = await Promise.all([
      Episode.find(query)
        .populate('genres', 'name')
        .sort({ episodeNumber: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      Episode.countDocuments(query)
    ]);

    return NextResponse.json({
      episodes,
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    });
    
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    const admin = userId ? await getAdminUser(userId) : null;
    
    if (!admin || !canDeleteContent(admin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { episodeId } = await req.json();
    if (!episodeId) {
      return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
    }

    const episode = await Episode.findByIdAndDelete(episodeId);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Remove from anime's episodes array
    await Anime.updateMany({}, { $pull: { episodes: episode._id } });

    return NextResponse.json({ 
      success: true, 
      message: 'Episode deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting episode:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}