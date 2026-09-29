import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  icon: string;
  slug: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

const ServiceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
