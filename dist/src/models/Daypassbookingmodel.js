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
exports.DayPass = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
const DayPassSchema = new mongoose_1.Schema({
    space: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Space', required: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    spaceName: { type: String, required: true },
    phone: { type: mongoose_1.default.Schema.Types.Mixed },
    bookeddate: { type: String, required: true },
    startTime: { type: String, default: '09:00 am' },
    endTime: { type: String, default: '09:00 pm' },
    creditsspent: { type: Number, default: 0 },
    date: { type: String },
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    transactionId: { type: String },
    transactionTIme: { type: String },
    transactionAmount: { type: Number },
    quantity: { type: Number, default: 1 },
    status: {
        type: String,
        // enum: [
        //   'pending',
        //   'confirmed',
        //   'cancelled',
        //   'authorized',
        //   'captured',
        //   'success',
        //   'failed',
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
        // enum: ["card", "paypal", "bank_transfer", "upi", "netbanking", "pending"],
        enum: ['credits', 'UPI', 'CARD', 'NETBANKING', 'pending'],
        default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
});
exports.DayPass = mongoose_1.default.model('DayPass', DayPassSchema);
