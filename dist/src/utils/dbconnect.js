"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Retrieve MongoDB URI from environment variables
const DBURL = process.env.DB_URL || '';
const dbconnect = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose_1.default.connect(DBURL, {
            connectTimeoutMS: 30000, // Set connection timeout to 30 seconds
        });
        console.log('MongoDB connected successfully');
    }
    catch (e) {
        console.error('MongoDB connection error:', e);
        process.exit(1); // Exit the process if connection fails
    }
};
// Listen to MongoDB connection events
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
mongoose_1.default.connection.on('connected', () => {
    console.log('MongoDB connected');
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
exports.default = dbconnect;
