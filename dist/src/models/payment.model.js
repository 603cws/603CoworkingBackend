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
exports.PaymentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking' },
    daypasses: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Daypasses' },
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
exports.PaymentModel = mongoose_1.default.model('Payment', paymentSchema);
