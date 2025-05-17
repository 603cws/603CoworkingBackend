import mongoose, { Schema, Document ,Types} from "mongoose";

interface ICoupon extends Document {
    code: string;
    discount: number; // percentage or fixed value
    expiryDate: Date;
    usageLimit: number;
}

const CouponSchema:Schema = new Schema<ICoupon>({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
});

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
