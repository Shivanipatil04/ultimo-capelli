import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InstagramGallery from '@/models/InstagramGallery';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  const body = await req.json();
  const updated = await InstagramGallery.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  await InstagramGallery.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
