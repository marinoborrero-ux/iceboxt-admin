import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;

    if (!filename) {
      return new NextResponse('Filename is required', { status: 400 });
    }

    const filePath = path.join('/var/data/images', filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.gif': 'image/gif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}