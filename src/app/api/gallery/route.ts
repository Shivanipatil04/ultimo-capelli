import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import InstagramGallery from '@/models/InstagramGallery';

export async function GET() {
  await dbConnect();
  const data = await InstagramGallery.find().sort({ sortOrder: 1, createdAt: -1 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const newItem = await InstagramGallery.create(body);
  return NextResponse.json(newItem, { status: 201 });
}
