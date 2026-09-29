import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function saveFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name).toLowerCase();
  const filename = `${uuidv4()}${ext}`;
  const dirPath = path.join(process.cwd(), UPLOAD_DIR, 'services');
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, filename), buffer);
  return `/uploads/services/${filename}`;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  const contentType = req.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    if (image && image.size > 0) {
      const imageUrl = await saveFile(image);
      const updated = await Service.findByIdAndUpdate(id, { image: imageUrl }, { new: true });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: 'No valid image provided' }, { status: 400 });
  } else {
    const body = await req.json();
    const updated = await Service.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  await Service.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
