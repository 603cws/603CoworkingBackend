import mongoose, { Document, Schema, Types } from 'mongoose';
import { any, string } from 'zod';

// Payment Schema
interface PaymentInterface extends Document {
  user: Types.ObjectId;
  booking: Types.ObjectId;
  daypasses: Types.ObjectId;
  amount: number;
  userName: String;
  email: String;
  // paymentMethod: "card" | "paypal" | "bank_transfer" | "netbanking" | "upi";
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'pending' | 'credits';
  // status:
  //   | "pending"
  //   | "completed"
  //   | "failed"
  //   | "authorized"
  //   | "success"
  //   | "captured";
  status: 'pending' | 'COMPLETED' | 'FAILED' | 'REFUND';
  paymentId: string;
  createdAt?: Date;
}

const paymentSchema: Schema = new Schema<PaymentInterface>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  daypasses: { type: Schema.Types.ObjectId, ref: 'Daypasses' },
  amount: { type: Number, required: true },
  userName: { type: String },
  email: { type: String },
  paymentMethod: {
    type: String,
    // enum: ['card', 'paypal', 'bank_transfer', 'upi', 'netbanking'],
    enum: ['credits', 'UPI', 'CARD', 'NETBANKING', 'pending'],

    required: true,
  },
  status: {
    type: String,
    // enum: [
    //   'pending',
    //   'completed',
    //   'failed',
    //   'authorized',
    //   'success',
    //   'captured',
    // ],
    enum: ['COMPLETED', 'FAILED', 'REFUND', 'pending'],
    default: 'pending',
  },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const PaymentModel = mongoose.model<PaymentInterface>(
  'Payment',
  paymentSchema
);
