// app/api/test-indexnow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { isFullAdmin } from '@/lib/admin-permissions';
import {
  submitUrlToIndexNow,
  submitMainPagesToIndexNow,
  submitAnimeToIndexNow,
  submitEpisodeToIndexNow
} from '@/lib/indexnow';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and permissions
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await User.findOne({ clerkId: userId }).lean();
    if (!admin || !isFullAdmin(admin as any)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { testType } = body;

    let result = false;
    let message = '';

    switch (testType) {
      case 'single-url':
        result = await submitUrlToIndexNow('/', 'IndexNow test - homepage');
        message = 'Tested single URL submission (homepage)';
        break;

      case 'main-pages':
        result = await submitMainPagesToIndexNow();
        message = 'Tested main pages submission';
        break;

      case 'anime':
        // Test with a dummy anime ID
        result = await submitAnimeToIndexNow('test-anime-id', 'Test Hentai');
        message = 'Tested hentai URL submission';
        break;

      case 'episode':
        // Test with dummy IDs
        result = await submitEpisodeToIndexNow('test-anime-id', 'test-episode-id', 'Test Episode 1');
        message = 'Tested episode URL submission';
        break;

      case 'all':
        // Test all functions
        const results = await Promise.allSettled([
          submitUrlToIndexNow('/', 'IndexNow test - homepage'),
          submitMainPagesToIndexNow(),
          submitAnimeToIndexNow('test-anime-id', 'Test Hentai'),
          submitEpisodeToIndexNow('test-anime-id', 'test-episode-id', 'Test Episode 1')
        ]);

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        result = successCount > 0;
        message = `Tested all functions - ${successCount}/${results.length} succeeded`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid test type. Use: single-url, main-pages, anime, episode, or all' }, { status: 400 });
    }

    return NextResponse.json({
      success: result,
      message,
      testType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IndexNow test error:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication and permissions
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await User.findOne({ clerkId: userId }).lean();
    if (!admin || !isFullAdmin(admin as any)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Return test information
    return NextResponse.json({
      message: 'IndexNow Test API',
      availableTests: [
        'single-url - Test single URL submission',
        'main-pages - Test main pages submission',
        'anime - Test hentai URL submission',
        'episode - Test episode URL submission',
        'all - Test all functions'
      ],
      usage: 'POST with { "testType": "test-name" }',
      keyFile: '5adf88428cd24eb58d0f9f2cd23246df.txt',
      keyLocation: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiTerra.ro'}/5adf88428cd24eb58d0f9f2cd23246df.txt`
    });

  } catch (error) {
    console.error('IndexNow test info error:', error);
    return NextResponse.json(
      { error: 'Failed to get test info' },
      { status: 500 }
    );
  }
}
