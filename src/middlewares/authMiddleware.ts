import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { log } from 'console';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    console.log('token value for det', token);
    console.log(req.headers);
    if (!token) {
      return res.status(401).json({
        msg: 'No token provided, unauthorized12345667',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRETKEY as string);
    if (decoded) {
      next();
    } else {
      return res.status(401).json({
        msg: 'Unauthorized',
      });
    }
  } catch (error) {
    // Handle errors, e.g., token expired, invalid token
    console.error('Token verification error:', error);
    return res.status(401).json({
      msg: 'Unauthorized',
      error:
        error instanceof Error ? error.message : 'Token verification failed',
    });
  }
};

export const corsEcape = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for this route
  next();
};
