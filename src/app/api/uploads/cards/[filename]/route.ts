import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Image } from '@/models';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Sanitize filename to prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    
    await connectToDatabase();
    
    try {
      const imageDoc = await Image.findOne({ filename: safeFilename });
      
      if (!imageDoc) {
        return new NextResponse('Image not found', { status: 404 });
      }
      
      return new NextResponse(imageDoc.data, {
        headers: {
          'Content-Type': imageDoc.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (dbError) {
      console.error(`Error reading card image from DB ${safeFilename}:`, dbError);
      return new NextResponse('Image not found', { status: 404 });
    }
  } catch (error) {
    console.error('Unexpected error in card image dynamic serve route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
