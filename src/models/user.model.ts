import mongoose, { Document, Schema, Types } from 'mongoose';

// User Schema
interface UsersInterface extends Document {
  companyName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'user';
  member: Boolean;
  kyc: Boolean;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  location: string;
  creditsleft: number;
  monthlycredits: number;
  extracredits: number;
  createdAt?: Date;
}

const usersSchema: Schema = new Schema<UsersInterface>({
  companyName: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  zipcode: { type: String },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  member: { type: Boolean, default: false },
  kyc: { type: Boolean, default: false },
  creditsleft: { type: Number, default: 0 },
  monthlycredits: { type: Number, default: 0 },
  location: { type: String },
  extracredits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<UsersInterface>('User', usersSchema);
