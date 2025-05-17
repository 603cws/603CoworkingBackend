"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsEcape = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                msg: 'No token provided, unauthorized',
            });
        }
        const token = authHeader.split(' ')[1];
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
        console.error('Token verification error:', error);
        return res.status(401).json({
            msg: 'Unauthorized',
            error: error instanceof Error ? error.message : 'Token verification failed',
        });
    }
};
exports.protect = protect;
// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     const token = cookies.token;
//     console.log('token value for det', token);
//     console.log(req.headers);
//     if (!token) {
//       return res.status(401).json({
//         msg: 'No token provided, unauthorized12345667',
//       });
//     }
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.SECRETKEY as string);
//     if (decoded) {
//       next();
//     } else {
//       return res.status(401).json({
//         msg: 'Unauthorized',
//       });
//     }
//   } catch (error) {
//     // Handle errors, e.g., token expired, invalid token
//     console.error('Token verification error:', error);
//     return res.status(401).json({
//       msg: 'Unauthorized',
//       error:
//         error instanceof Error ? error.message : 'Token verification failed',
//     });
//   }
// };
const corsEcape = async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
};
exports.corsEcape = corsEcape;
// export const corsEcape = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for this route
//   next();
// };
