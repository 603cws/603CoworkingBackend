"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelledBookingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const cancelledbookingSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    space: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Space', required: true },
    companyName: { type: String, required: true },
    spaceName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    creditsspent: { type: Number, default: 0 }, // Default value set to 0
    date: { type: String, required: true },
    transactionId: { type: String },
    transactionTIme: { type: String },
    transactionAmount: { type: Number },
    daypassQuantity: { type: Number, default: 0 },
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
exports.CancelledBookingModel = mongoose_1.default.model('CancelledBooking', cancelledbookingSchema);
