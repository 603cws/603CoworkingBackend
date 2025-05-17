"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// export const admin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     console.log('cookie', req.headers.cookie);
//     const token = cookies.token;
//     console.log('token value for det', token);
//     if (!token) {
//       return res.status(401).json({
//         msg: 'No token provided, unauthorized12345',
//       });
//     }
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.SECRETKEY as string);
//     if (!decoded || (decoded as any).role !== 'admin') {
//       return res.status(403).json({ msg: 'Access denied' });
//     }
//     next();
//   } catch (error) {
//     console.error('Error in admin middleware:', error);
//     return res.status(500).json({ msg: 'Internal server errorwdkpawkaa' });
//   }
// };
const admin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                msg: 'No token provided, unauthorized',
            });
        }
        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRETKEY);
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }
        next();
    }
    catch (error) {
        console.error('Error in admin middleware:', error);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};
exports.admin = admin;
