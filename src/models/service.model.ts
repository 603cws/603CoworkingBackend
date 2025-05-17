import mongoose, { Document, Schema } from "mongoose";

// Service Schema
interface ServiceInterface extends Document {
    user: mongoose.Types.ObjectId;
    space: mongoose.Types.ObjectId;
    name: String;
    description: String;
    rate: Number;
    createdAt: Date;
}

const ServiceSchema: Schema = new Schema<ServiceInterface>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    space: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    name: { type: String, required: true }, 
    description: { type: String },
    rate: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now }
});

export const ServiceModel = mongoose.model<ServiceInterface>('Service', ServiceSchema);