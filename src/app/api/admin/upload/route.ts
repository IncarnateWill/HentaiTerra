import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User, Image } from '@/models';
import { isFullAdmin } from '@/lib/admin-permissions';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Verify admin permissions
    const admin = await User.findOne({ clerkId: userId }).lean();
    if (!admin || typeof admin !== 'object' || Array.isArray(admin) || !isFullAdmin(admin as { roles?: string[] })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type (should be an image)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // 5. Read buffer and save file
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate clean unique filename
    const rawName = file.name || 'card';
    const cleanName = rawName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExt = path.extname(cleanName) || '.png';
    const baseName = path.basename(cleanName, fileExt);
    const filename = `${baseName}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    // Save file data to database
    await Image.create({
      filename,
      contentType: file.type || 'image/png',
      data: buffer
    });

    // Return the relative web path using the dynamic serve API
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const fileUrl = `${siteUrl}/api/uploads/cards/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error uploading card image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
