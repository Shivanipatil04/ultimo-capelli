import mongoose, { Schema, Document } from 'mongoose';

export interface IInstagramGallery extends Document {
  instagramUrl: string;
  title?: string;
  isActive: boolean;
  sortOrder: number;
}

const InstagramGallerySchema: Schema = new Schema({
  instagramUrl: { type: String, required: true },
  title: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.InstagramGallery || mongoose.model<IInstagramGallery>('InstagramGallery', InstagramGallerySchema);
