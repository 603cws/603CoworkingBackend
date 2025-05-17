import mongoose, { Document, Schema, Types } from 'mongoose';
import { Cards } from 'razorpay/dist/types/cards';
import { string } from 'zod';

// Booking Schema
interface BookingInterface extends Document {
  user: Types.ObjectId;
  space: Types.ObjectId;
  companyName: string;
  spaceName: string;
  startTime: string;
  endTime: string;
  creditsspent: number;
  date: string;
  // status:
  //   | 'pending'
  //   | 'confirmed'
  //   | 'cancelled'
  //   | 'captured'
  //   | 'failed'
  //   | 'refunded'
  //   | 'authorized';

  status:
    | 'pending'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUND'
    | 'confirmed'
    | 'cancelled';

  // paymentMethod:
  //   | 'pending'
  //   | 'credits'
  //   | 'credit_card'
  //   | 'paypal'
  //   | 'upi'
  //   | 'card';

  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'pending' | 'credits';
  transactionId: string;
  transactionTIme: string;
  transactionAmount: number;
  createdAt?: Date;
}

const bookingSchema: Schema<BookingInterface> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  space: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
  companyName: { type: String, required: true },
  spaceName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  creditsspent: { type: Number, default: 0 }, // Default value set to 0
  date: { type: String, required: true },
  transactionId: { type: String },
  transactionTIme: { type: String },
  transactionAmount: { type: Number },
  status: {
    type: String,
    // enum: [
    //   'pending',
    //   'confirmed',
    //   'cancelled',
    //   'captured',
    //   'failed',
    //   'refunded',
    //   'authorized',
    // ],
    enum: [
      'COMPLETED',
      'FAILED',
      'REFUND',
      'pending',
      'confirmed',
      'cancelled',
    ],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    // enum: ["credits", "credit_card", "paypal", "pending", "upi", "card"],
    enum: ['credits', 'UPI', 'CARD', 'NETBANKING', 'pending'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export const BookingModel = mongoose.model<BookingInterface>(
  'Booking',
  bookingSchema
);
