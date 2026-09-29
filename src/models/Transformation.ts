import mongoose, { Schema, Document } from 'mongoose';

export interface ITransformation extends Document {
  beforeImage: string;
  afterImage: string;
  title?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

const TransformationSchema: Schema = new Schema({
  beforeImage: { type: String, required: true },
  afterImage: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Transformation || mongoose.model<ITransformation>('Transformation', TransformationSchema);
