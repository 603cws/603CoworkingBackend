"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminlogin = exports.logout = exports.login = void 0;
const user_model_1 = require("../models/user.model");
const types_1 = require("../zodTypes/types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// import cookie from 'cookie';
const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const validate = types_1.loginInputs.safeParse({ usernameOrEmail, password });
    if (!validate.success) {
        return res.status(400).json({ msg: 'Invalid Inputs' });
    }
    try {
        const user = await user_model_1.UserModel.findOne({
            $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        }).exec();
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: 'Invalid password' });
        }
        const secretKey = process.env.SECRETKEY;
        if (!secretKey) {
            return res.status(500).json({ msg: 'JWT secret key is not defined' });
        }
        const token = jsonwebtoken_1.default.sign({ name: user.companyName, id: user._id, role: user.role }, secretKey, { expiresIn: '12h' });
        // Set the JWT token as a cookie for localhost
        // res.setHeader(
        //   'Set-Cookie',
        //   cookie.serialize('token', token, {
        //     httpOnly: true,
        //     maxAge: 3600,
        //     sameSite: 'none', // 'lax' is generally safe for CSRF protection
        //     secure: true, // Ensure this is served over HTTPS in production
        //     path: '/',
        //     domain: '.603-coworking-backend.vercel.app',
        //   })
        // );
        // return res.status(200).json({ msg: 'User signed in', user, token });
        // ✅ Send token in JSON instead of setting cookie
        return res.status(200).json({ msg: 'User signed in', user, token });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ msg: 'Internal server error12345', error: e });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        // res.setHeader(
        //   'Set-Cookie',
        //   cookie.serialize('token', '', {
        //     httpOnly: true,
        //     expires: new Date(0), // Expire the cookie
        //     sameSite: 'none', // 'lax' is generally safe for CSRF protection
        //     secure: true, // Ensure this is served over HTTPS in production
        //     path: '/', // Match this with logout
        //     domain: '.603-coworking-backend.vercel.app',
        //   })
        // );
        return res.status(200).json({ msg: 'User logged out successfully' });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};
exports.logout = logout;
const adminlogin = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const validate = types_1.loginInputs.safeParse({ usernameOrEmail, password });
    if (!validate.success) {
        return res.status(400).json({ msg: 'Invalid Inputs' });
    }
    try {
        const user = await user_model_1.UserModel.findOne({
            $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        }).exec();
        if (!user || user.role !== 'admin') {
            return res.status(404).json({ msg: 'No such admin account' });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: 'Invalid password' });
        }
        const secretKey = process.env.SECRETKEY;
        if (!secretKey) {
            return res.status(500).json({ msg: 'JWT secret key is not defined' });
        }
        const token = jsonwebtoken_1.default.sign({ name: user.companyName, id: user._id, role: user.role }, secretKey, { expiresIn: '24h' });
        // Set the JWT token as a cookie for localhost
        // res.setHeader(
        //   'Set-Cookie',
        //   cookie.serialize('token', token, {
        //     httpOnly: true,
        //     maxAge: 3600, // 1 hour
        //     sameSite: 'none', // 'lax' is generally safe for CSRF protection
        //     secure: true, // Ensure this is served over HTTPS in production
        //     path: '/', // Match this with logout
        //     domain: '.603-coworking-backend.vercel.app',
        //   })
        // );
        return res
            .status(200)
            .json({ msg: 'Admin signed in', user: user.companyName, token });
    }
    catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ msg: 'Internal server error67890', error: e });
    }
};
exports.adminlogin = adminlogin;
