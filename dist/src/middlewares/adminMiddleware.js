"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
const admin = async (req, res, next) => {
    try {
        const cookies = cookie_1.default.parse(req.headers.cookie || "");
        console.log("cookie", req.headers.cookie);
        const token = cookies.token;
        console.log("token value for det", token);
        if (!token) {
            return res.status(401).json({
                msg: "No token provided, unauthorized12345",
            });
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRETKEY);
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({ msg: "Access denied" });
        }
        next();
    }
    catch (error) {
        console.error("Error in admin middleware:", error);
        return res.status(500).json({ msg: "Internal server errorwdkpawkaa" });
    }
};
exports.admin = admin;
