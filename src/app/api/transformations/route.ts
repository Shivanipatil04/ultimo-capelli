import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transformation from '@/models/Transformation';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

async function saveFile(file: File, subDir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Safe filename
  const ext = path.extname(file.name).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    throw new Error('Invalid file type');
  }
  
  const filename = `${uuidv4()}${ext}`;
  const dirPath = path.join(process.cwd(), UPLOAD_DIR, 'transformations', subDir);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filepath = path.join(dirPath, filename);
  fs.writeFileSync(filepath, buffer);
  
  return `/uploads/transformations/${subDir}/${filename}`;
}

export async function GET() {
  await dbConnect();
  const data = await Transformation.find().sort({ sortOrder: 1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  
  try {
    const formData = await req.formData();
    const beforeFile = formData.get('beforeImage') as File | null;
    const afterFile = formData.get('afterImage') as File | null;
    const title = formData.get('title') as string || '';
    const description = formData.get('description') as string || '';
    const sortOrder = parseInt(formData.get('sortOrder') as string || '0', 10);
    
    if (!beforeFile || !afterFile) {
      return NextResponse.json({ error: 'Both images required' }, { status: 400 });
    }
    
    const beforeUrl = await saveFile(beforeFile, 'before');
    const afterUrl = await saveFile(afterFile, 'after');
    
    const newItem = await Transformation.create({
      beforeImage: beforeUrl,
      afterImage: afterUrl,
      title,
      description,
      sortOrder
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
