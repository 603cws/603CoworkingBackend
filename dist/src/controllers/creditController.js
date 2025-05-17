"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoinPurchase = exports.updateCoinPurchaseStatus = exports.getCoinPurchaseByUserId = exports.getAllCoinPurchases = exports.createCoinPurchase = exports.getcreditsdetails = void 0;
const coin_model_1 = require("../models/coin.model");
const user_model_1 = require("../models/user.model");
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getcreditsdetails = async (req, res) => {
    try {
        const cookies = cookie_1.default.parse(req.headers.cookie || '');
        const token = cookies.token;
        console.log(token);
        const secretKey = process.env.SECRETKEY;
        if (!secretKey) {
            console.error("JWT secret key is not defined");
            return res.status(500).json({ msg: "JWT secret key is not defined" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        const id = decoded.id;
        console.log("User ID from token:", id);
        const user = await user_model_1.UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        console.log("User from database:", user);
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Error fetching user details", error });
    }
};
exports.getcreditsdetails = getcreditsdetails;
const createCoinPurchase = async (req, res) => {
    const { user, amount, paymentMethod } = req.body;
    try {
        const newCoinPurchase = new coin_model_1.CoinPurchaseModel({
            user,
            amount,
            paymentMethod,
            status: "pending",
        });
        const coinPurchase = await newCoinPurchase.save();
        res.status(201).json(coinPurchase);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating coin purchase", error });
    }
};
exports.createCoinPurchase = createCoinPurchase;
// Get all coin purchases
const getAllCoinPurchases = async (req, res) => {
    try {
        const coinPurchases = await coin_model_1.CoinPurchaseModel.find().populate("user");
        res.status(200).json(coinPurchases);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching coin purchases", error });
    }
};
exports.getAllCoinPurchases = getAllCoinPurchases;
// Get coin purchase by user ID
const getCoinPurchaseByUserId = async (req, res) => {
    const userId = req.params.id;
    try {
        const coinPurchases = await coin_model_1.CoinPurchaseModel.find({ user: userId }).populate("user");
        if (!coinPurchases) {
            return res.status(404).json({ message: "Coin purchases not found" });
        }
        res.status(200).json(coinPurchases);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching coin purchases by user ID", error });
    }
};
exports.getCoinPurchaseByUserId = getCoinPurchaseByUserId;
// Update coin purchase status
const updateCoinPurchaseStatus = async (req, res) => {
    const purchaseId = req.params.id;
    const { status } = req.body;
    try {
        const updatedCoinPurchase = await coin_model_1.CoinPurchaseModel.findByIdAndUpdate(purchaseId, { status }, { new: true, runValidators: true });
        if (!updatedCoinPurchase) {
            return res.status(404).json({ message: "Coin purchase not found" });
        }
        res.status(200).json(updatedCoinPurchase);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating coin purchase status", error });
    }
};
exports.updateCoinPurchaseStatus = updateCoinPurchaseStatus;
// Delete a coin purchase
const deleteCoinPurchase = async (req, res) => {
    const purchaseId = req.params.id;
    try {
        const deletedCoinPurchase = await coin_model_1.CoinPurchaseModel.findByIdAndDelete(purchaseId);
        if (!deletedCoinPurchase) {
            return res.status(404).json({ message: "Coin purchase not found" });
        }
        res.status(200).json({ message: "Coin purchase deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting coin purchase", error });
    }
};
exports.deleteCoinPurchase = deleteCoinPurchase;
