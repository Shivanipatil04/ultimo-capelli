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

export async function GET() {
  await dbConnect();
  const data = await Service.find().sort({ sortOrder: 1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const formData = await req.formData();
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const icon = formData.get('icon') as string;
  const slug = formData.get('slug') as string;
  const sortOrder = parseInt(formData.get('sortOrder') as string || '0');
  
  let imageUrl = '';
  const image = formData.get('image') as File | null;
  if (image && image.size > 0) {
    imageUrl = await saveFile(image);
  }

  const newItem = await Service.create({
    title, description, icon, slug, sortOrder, isActive: true, image: imageUrl || undefined
  });
  return NextResponse.json(newItem, { status: 201 });
}
