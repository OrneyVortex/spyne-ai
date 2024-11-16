import mongoose, { Document, Schema } from 'mongoose';

export interface ICar extends Document {
  user: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

const CarSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  images: { type: [String], maxlength: 10 },
});

export const Car = mongoose.model<ICar>('Car', CarSchema);