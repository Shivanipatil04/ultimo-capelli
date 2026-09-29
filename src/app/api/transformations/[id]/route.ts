import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transformation from '@/models/Transformation';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  const body = await req.json(); // Usually for text updates like title, sortOrder, isActive
  const updated = await Transformation.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  
  const item = await Transformation.findById(id);
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Safely delete files
  const deleteFile = (fileUrl: string) => {
    try {
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const filepath = path.join(process.cwd(), UPLOAD_DIR, relativePath);
      // Prevent path traversal
      if (filepath.startsWith(path.join(process.cwd(), UPLOAD_DIR)) && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (e) {
      console.error("Error deleting file", e);
    }
  };
  
  deleteFile(item.beforeImage);
  deleteFile(item.afterImage);
  
  await Transformation.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
