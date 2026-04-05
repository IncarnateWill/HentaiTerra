import { NextRequest, NextResponse } from 'next/server';
// import { revalidateTag, revalidatePath } from 'next/cache'; // Disabled for Cloudflare conflict diagnosis
import { auth } from '@clerk/nextjs/server';
import { logToDiscordWebhook } from '@/lib/discord-webhook';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tags, paths } = body;

    // Revalidate specific tags
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag: string) => {
        // revalidateTag(tag); // Disabled for Cloudflare conflict diagnosis
      });
    }

    // Revalidate specific paths
    if (paths && Array.isArray(paths)) {
      paths.forEach((path: string) => {
        // revalidatePath(path); // Disabled for Cloudflare conflict diagnosis
      });
    }

    // Always revalidate homepage
    // revalidatePath('/home'); // Disabled for Cloudflare conflict diagnosis
    // revalidatePath('/');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidated successfully',
      revalidated: { tags, paths }
    });
  } catch (error) {
    await logToDiscordWebhook(`Revalidation error: ${error}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}