import mongoose, { Document, Schema } from 'mongoose';

// Space Schema
interface SpaceInterface extends Document {
  name: string;
  roomtype: 'conference' | 'meeting' | 'daypass';
  location: string;
  description?: string;
  amenities?: string[];
  capacity: number;
  availableCapacity: number;
  price: number;
  createdAt?: Date;
}

const spaceSchema: Schema = new Schema<SpaceInterface>({
  name: { type: String, required: true },
  roomtype: { type: String, enum: ['conference', 'meeting', 'daypass'] },
  location: { type: String, required: true },
  description: { type: String },
  amenities: { type: [String] },
  capacity: { type: Number, required: true },
  availableCapacity: { type: Number, min: 0 },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const SpaceModel = mongoose.model<SpaceInterface>('Space', spaceSchema);
