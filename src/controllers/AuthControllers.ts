import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { loginInputs } from '../zodTypes/types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// import cookie from 'cookie';

export const login = async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  const validate = loginInputs.safeParse({ usernameOrEmail, password });

  if (!validate.success) {
    return res.status(400).json({ msg: 'Invalid Inputs' });
  }

  try {
    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).exec();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'Invalid password' });
    }

    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }

    const token = jwt.sign(
      { name: user.companyName, id: user._id, role: user.role },
      secretKey,
      { expiresIn: '12h' }
    );

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
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ msg: 'Internal server error12345', error: e });
  }
};

export const logout = async (req: Request, res: Response) => {
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
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

export const adminlogin = async (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  const validate = loginInputs.safeParse({ usernameOrEmail, password });
  if (!validate.success) {
    return res.status(400).json({ msg: 'Invalid Inputs' });
  }

  try {
    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).exec();
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ msg: 'No such admin account' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'Invalid password' });
    }

    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }

    const token = jwt.sign(
      { name: user.companyName, id: user._id, role: user.role },
      secretKey,
      { expiresIn: '24h' }
    );

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
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ msg: 'Internal server error67890', error: e });
  }
};
