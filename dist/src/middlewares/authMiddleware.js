"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsEcape = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
const protect = async (req, res, next) => {
    try {
        const cookies = cookie_1.default.parse(req.headers.cookie || '');
        const token = cookies.token;
        console.log('token value for det', token);
        console.log(req.headers);
        if (!token) {
            return res.status(401).json({
                msg: 'No token provided, unauthorized12345667',
            });
        }
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRETKEY);
        if (decoded) {
            next();
        }
        else {
            return res.status(401).json({
                msg: 'Unauthorized',
            });
        }
    }
    catch (error) {
        // Handle errors, e.g., token expired, invalid token
        console.error('Token verification error:', error);
        return res.status(401).json({
            msg: 'Unauthorized',
            error: error instanceof Error ? error.message : 'Token verification failed',
        });
    }
};
exports.protect = protect;
const corsEcape = async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for this route
    next();
};
exports.corsEcape = corsEcape;
