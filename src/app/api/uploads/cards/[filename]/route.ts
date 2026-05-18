import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Sanitize filename to prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    
    // Path inside public/uploads/cards where files are written
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'cards', safeFilename);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on extension
      const ext = path.extname(safeFilename).toLowerCase();
      let contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.webp') {
        contentType = 'image/webp';
      } else if (ext === '.gif') {
        contentType = 'image/gif';
      } else if (ext === '.svg') {
        contentType = 'image/svg+xml';
      }
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (readError) {
      console.error(`Error reading card image file from path ${filePath}:`, readError);
      return new NextResponse('Image not found', { status: 404 });
    }
  } catch (error) {
    console.error('Unexpected error in card image dynamic serve route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
