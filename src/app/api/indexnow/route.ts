// app/api/indexnow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { isFullAdmin, canManageContent } from '@/lib/admin-permissions';
import { submitToIndexNow, submitUrlToIndexNow, submitMainPagesToIndexNow } from '@/lib/indexnow';

export async function POST(req: NextRequest) {
  try {
    // Check authentication and permissions
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await User.findOne({ clerkId: userId }).lean();
    if (!admin || (!isFullAdmin(admin as any) && !canManageContent(admin as any))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { urls, url, type, reason } = body;

    let result = false;

    if (type === 'main-pages') {
      // Submit main pages
      result = await submitMainPagesToIndexNow();
    } else if (url) {
      // Submit single URL
      result = await submitUrlToIndexNow(url, reason || 'Manual submission');
    } else if (urls && Array.isArray(urls)) {
      // Submit multiple URLs
      result = await submitToIndexNow(urls, reason || 'Bulk manual submission');
    } else {
      return NextResponse.json({ error: 'Invalid request. Provide url, urls array, or type=main-pages' }, { status: 400 });
    }

    return NextResponse.json({
      success: result,
      message: result ? 'URLs submitted successfully' : 'Submission failed'
    });

  } catch (error) {
    console.error('IndexNow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    if (!admin || (!isFullAdmin(admin as any) && !canManageContent(admin as any))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return IndexNow configuration info
    return NextResponse.json({
      keyFile: '5adf88428cd24eb58d0f9f2cd23246df.txt',
      keyLocation: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://HentaiTerra.ro'}/5adf88428cd24eb58d0f9f2cd23246df.txt`,
      supportedEngines: ['Bing', 'Microsoft'],
      status: 'active'
    });

  } catch (error) {
    console.error('IndexNow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
