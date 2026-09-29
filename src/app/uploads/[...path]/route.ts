import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  const safePath = path.join(...pathParts.map(p => path.basename(p)));
  const filepath = path.join(process.cwd(), UPLOAD_DIR, safePath);

  if (!filepath.startsWith(path.join(process.cwd(), UPLOAD_DIR))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(filepath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const stat = fs.statSync(filepath);
  const stream = fs.createReadStream(filepath) as any;
  
  const ext = path.extname(filepath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';

  return new NextResponse(stream, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
