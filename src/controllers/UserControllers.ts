import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { SpaceModel } from '../models/space.model';
import { createuserInputs } from '../zodTypes/types';
import { kycmodel } from '../models/kyc.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { sendEmailAdmin, sendEmailSales } from '../utils/emailUtils';
import cookie from 'cookie';
import path from 'path';
import fs from 'fs';

import {
  createLead,
  createLeadPopupForm,
  requestTourLead,
} from './zohoController';
// import { decode } from 'punycode';
// import { log } from 'console';

export const createuser = async (req: Request, res: Response) => {
  const body = req.body;
  const validate = createuserInputs.safeParse(body);

  if (!validate.success) {
    return res.status(400).json({ msg: 'Invalid Inputs' });
  }

  try {
    const {
      companyName,
      email,
      password,
      phone,
      username,
      country,
      state,
      zipcode,
      city,
      monthlycredits,
      location,
      member,
      role,
    } = body;

    const usernameExists = await UserModel.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ msg: 'Username exists' });
    }

    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ msg: 'Email exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      companyName,
      username,
      email,
      password: hashedPassword,
      phone,
      role: role,
      kyc: false,
      country,
      state,
      zipcode,
      location,
      city,
      creditsleft: monthlycredits,
      monthlycredits,
      member,
      createdAt: Date.now(),
    });

    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      console.error('JWT secret key is not defined');
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }

    const token = jwt.sign({ id: user._id, companyName }, secretKey, {
      expiresIn: '1h',
    });

    return res
      .status(201)
      .json({ msg: 'User created', jwt: token, user: user.companyName });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Internal server error1' });
  }
};
// export const createuser = async (req: Request, res: Response) => {
//   const body = req.body;
//   const validate = createuserInputs.safeParse(body);

//   if (!validate.success) {
//     return res.status(400).json({ msg: 'Invalid Inputs' });
//   }

//   try {
//     const {
//       companyName,
//       email,
//       password,
//       phone,
//       username,
//       country,
//       state,
//       zipcode,
//       city,
//       monthlycredits,
//       location,
//       member,
//     } = body;

//     const usernameExists = await UserModel.findOne({ username });
//     if (usernameExists) {
//       return res.status(409).json({ msg: 'Username exists' });
//     }

//     const emailExists = await UserModel.findOne({ email });
//     if (emailExists) {
//       return res.status(409).json({ msg: 'Email exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await UserModel.create({
//       companyName,
//       username,
//       email,
//       password: hashedPassword,
//       phone,
//       role: 'user',
//       kyc: false,
//       country,
//       state,
//       zipcode,
//       location,
//       city,
//       creditsleft: monthlycredits,
//       monthlycredits,
//       member,
//       createdAt: Date.now(),
//     });

//     const secretKey = process.env.SECRETKEY;
//     if (!secretKey) {
//       console.error('JWT secret key is not defined');
//       return res.status(500).json({ msg: 'JWT secret key is not defined' });
//     }

//     const token = jwt.sign({ id: user._id, companyName }, secretKey, {
//       expiresIn: '1h',
//     });

//     return res
//       .status(201)
//       .json({ msg: 'User created', jwt: token, user: user.companyName });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ msg: 'Internal server error1' });
//   }
// };

// Get user's details
export const getuserdetailsorig = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token provided, unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const id = decoded.id;
    console.log('User ID from token:', id);

    const user = await UserModel.findById(id);
    console.log('User from database:', user);

    if (!user) {
      return res.status(404).json({ msg: 'No such user' });
    }

    res.status(200).json({ user });
  } catch (e) {
    console.error('Error in getuserdetailsorig:', e);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
// export const getuserdetailsorig = async (req: Request, res: Response) => {
//   const secretKey = process.env.SECRETKEY;
//   if (!secretKey) {
//     console.error('JWT secret key is not defined');
//     return res.status(500).json({ msg: 'JWT secret key is not defined' });
//   }

//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     console.log('jsdodckj   ', req.headers);
//     const token = cookies.token;
//     console.log(token);

//     const decoded: any = jwt.verify(token, secretKey);
//     console.log('Decoded token:', decoded);

//     const id = decoded.id;
//     console.log('User ID from token:', id);

//     const user = await UserModel.findById(id);
//     console.log('User from database:', user);
//     if (!user) {
//       return res.status(404).json({ msg: 'No such user' });
//     }
//     res.status(200).json({ user: user });
//   } catch (e) {
//     res.status(500).json({ msg: 'Internal server error2' });
//   }
// };

export const getuserdetails = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Token is missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const id = decoded.id;
    console.log('User ID from token:', id);

    const user = await UserModel.findById(id);
    console.log('User from database:', user);

    if (!user) {
      return res.status(404).json({ msg: 'No such user' });
    }

    res.status(200).json({ user });
  } catch (e) {
    console.error('Error:', e);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const checkauth = async (req: Request, res: Response) => {
  try {
    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      console.error('JWT secret key is not defined');
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ auth: false, user: 'user' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;

    if (decoded) {
      const getuser = await UserModel.findById(decoded.id);
      return res
        .status(200)
        .json({ auth: true, user: decoded.role, accHolder: getuser });
    } else {
      return res.status(401).json({ auth: false, user: 'user' });
    }
  } catch (error) {
    console.error('Error in authentication:', error);
    res
      .status(500)
      .json({ msg: 'Internal server error', auth: false, user: 'user' });
  }
};
// export const getuserdetails = async (req: Request, res: Response) => {
//   const secretKey = process.env.SECRETKEY;
//   if (!secretKey) {
//     console.error('JWT secret key is not defined');
//     return res.status(500).json({ msg: 'JWT secret key is not defined' });
//   }

//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     console.log('jsdodckj   ', req.headers);
//     const token = cookies.token;
//     console.log(token);
//     if (!token) {
//       return res.status(401).json({ msg: 'Token is missing' });
//     }

//     const decoded: any = jwt.verify(token, secretKey);
//     console.log('Decoded token:', decoded);

//     const id = decoded.id;
//     console.log('User ID from token:', id);

//     const user = await UserModel.findById(id);
//     console.log('User from database:', user);

//     if (!user) {
//       return res.status(404).json({ msg: 'No such user' });
//     }

//     res.status(200).json({ user });
//   } catch (e) {
//     console.error('Error:', e);
//     res.status(500).json({ msg: 'Internal server error' });
//   }
// };

// export const checkauth = async (req: Request, res: Response) => {
//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     const token = cookies.token;
//     const secretKey = process.env.SECRETKEY;

//     if (!secretKey) {
//       console.error('JWT secret key is not defined');
//       return res.status(500).json({ msg: 'JWT secret key is not defined' });
//     }

//     if (!token) {
//       return res.status(401).json({ auth: false, user: 'user' });
//     }

//     const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;

//     if (decoded) {
//       const getuser = await UserModel.findById(decoded.id);
//       // Assuming user.role is the role you want to check
//       return res
//         .status(200)
//         .json({ auth: true, user: decoded.role, accHolder: getuser });
//     }
//   } catch (error) {
//     console.error('Error in authentication:', error);
//     res
//       .status(500)
//       .json({ msg: 'Internal server error', auth: false, user: 'user' });
//   }
// };

export const sendcallback = async (req: Request, res: Response) => {
  try {
    const sales = process.env.EMAIL_SALES || '';
    const { email, name, phone, company, requirements } = req.body;

    const templatePath = path.join(__dirname, '../utils/callbackuser.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    let data = {
      name,
      email,
      phone,
      company,
      requirements,
    };

    await createLeadPopupForm(data);

    // const a = name;
    // const htmlContent = htmlTemplate.replace('{{name}}', a);

    // await sendEmailSales(
    //   email,
    //   'Your CallBack request has been sent',
    //   'Your request has been successfully confirmed.',
    //   htmlContent
    // );

    // const templatePath2 = path.join(__dirname, '../utils/callbackadmin.html');
    // let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');

    // const htmlContent2 = htmlTemplate2
    //   .replace('{{name}}', a)
    //   .replace('{{phone}}', phone)
    //   .replace('{{email}}', email)
    //   .replace('{{company}}', company)
    //   .replace('{{requirements}}', requirements);

    // await sendEmailSales(
    //   sales,
    //   'CallBack request recieved',
    //   'A callback request has been recieved.',
    //   htmlContent2
    // );

    res
      .status(200)
      .json({ msg: 'Request sent to both user and admin successfully!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Internal server error3' });
  }
};

export const requestTour = async (req: Request, res: Response) => {
  try {
    //sales email
    const sales = process.env.EMAIL_SALES || '';

    //requested body
    const { name, email, phone, location, intrestedIn } = req.body;

    //email template for user
    const templatePath = path.join(__dirname, '../utils/callbackuser.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const a = name;
    const htmlContent = htmlTemplate.replace('{{name}}', a);

    await sendEmailSales(
      email,
      'Your Tour request has been sent',
      'Your request has been successfully confirmed.',
      htmlContent
    );

    //email template for admin
    const templatePath2 = path.join(
      __dirname,
      '../utils/requesttouradmin.html'
    );

    //reading the template
    let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');

    //replacing the placeholders in email
    const htmlContent2 = htmlTemplate2
      .replace('{{name}}', name)
      .replace('{{phone}}', phone)
      .replace('{{email}}', email)
      .replace('{{location}}', location)
      .replace('{{intrestedIn}}', intrestedIn);

    await sendEmailAdmin(
      sales,
      'Tour request recieved',
      'A Tour request has been recieved.',
      htmlContent2
    );
    //send the data to the zoho lead
    const zohoLead = await requestTourLead(req.body);
    res.status(200).json('success');
  } catch (error: any) {
    console.log(error.message);
    res.status(400).json({
      error,
      message: 'something went wrong',
    });
  }
};

export const contactus = async (req: Request, res: Response) => {
  try {
    const sales = process.env.EMAIL_SALES || '';
    const {
      name,
      phone,
      email,
      location,
      seats,
      company,
      specifications,
      requirements,
    } = req.body;

    let data = {
      name,
      phone,
      email,
      location,
      company,
      requirements,
      specifications,
    };

    await createLead(data);

    const templatePath = path.join(__dirname, '../utils/callbackuser.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    const a = name;
    const htmlContent = htmlTemplate.replace('{{name}}', a);

    await sendEmailSales(
      email,
      'Your CallBack request has been sent',
      'Your request has been successfully confirmed.',
      htmlContent
    );

    const templatePath2 = path.join(__dirname, '../utils/callbackadmin.html');
    let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');

    const htmlContent2 = htmlTemplate2
      .replace('{{name}}', a)
      .replace('{{phone}}', phone)
      .replace('{{email}}', email)
      .replace('{{pref}}', location)
      .replace('{{company}}', company)
      .replace('{{seats}}', seats)
      .replace('{{Specifications}}', specifications)
      .replace('{{requirements}}', requirements);

    await sendEmailSales(
      sales,
      'Customer is trying to contact',
      'A customer has raised a contact request.',
      htmlContent2
    );

    res
      .status(200)
      .json({ msg: 'Request sent to both user and admin successfully!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Internal server error3' });
  }
};

export const contactusInterior = async (req: Request, res: Response) => {
  try {
    // console.log(req.body);
    const sales = process.env.EMAIL_SALES || '';
    const { name, phone, email, company, message } = req.body;

    const templatePath = path.join(
      __dirname,
      '../utils/callbackuserinterior.html'
    );
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const a = name;
    const htmlContent = htmlTemplate.replace('{{name}}', a);

    await sendEmailSales(
      email,
      'Your CallBack request has been sent',
      'Your request has been successfully confirmed.',
      htmlContent
    );

    const templatePath2 = path.join(
      __dirname,
      '../utils/callbackadmininterior.html'
    );
    let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');

    const htmlContent2 = htmlTemplate2
      .replace('{{name}}', a)
      .replace('{{phone}}', phone)
      .replace('{{email}}', email)
      .replace('{{company}}', company)
      .replace('{{message}}', message);

    await sendEmailSales(
      sales,
      'Customer is trying to contact',
      'A customer has raised a contact request.',
      htmlContent2
    );
    res
      .status(200)
      .json({ msg: 'Request sent to both user and admin successfully!' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Internal server error3' });
  }
};

// Function to get all users
export const getusers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({ role: 'user' });
    res.status(200).json({ msg: users });
  } catch (err) {
    res.status(500).json({ msg: 'Internal server error3' });
  }
};

// Function to get user info by ID
export const userbyid = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'No such user' });
    }
    res.status(200).json({ msg: user });
  } catch (e) {
    res.status(500).json({ msg: 'Internal server error4edoj' });
  }
};

// Function to delete a user
export const deleteuser = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'No such user' });
    }
    await UserModel.deleteOne({ _id: id });
    res.status(200).json({ msg: 'User deleted' });
  } catch (e) {
    res.status(500).json({ msg: 'Internal server error5' });
  }
};

// Function to change password by user
export const changepasswordbyuser = async (req: Request, res: Response) => {
  console.log('Change password request received');
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }

  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Token is missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const id = decoded.id;
    console.log('User ID from token:', id);

    const user = await UserModel.findById(id);
    console.log('User from database:', user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword) {
      return res
        .status(400)
        .json({ msg: 'Old password and new password are required' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Old password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    const userEmail = user.email;

    // Read HTML template from file
    const templatePath = path.join(__dirname, '../utils/passwordchange.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const companyName = user.companyName || 'User';
    const htmlContent = htmlTemplate.replace('{{name}}', companyName);

    // Send confirmation email
    await sendEmailAdmin(
      userEmail,
      'Password Changed Successfully',
      'Your password has been changed successfully.',
      htmlContent
    );

    await user.save();

    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (e) {
    console.error('Error changing password:', e);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
// export const changepasswordbyuser = async (req: Request, res: Response) => {
//   console.log('djeodjopkpk');
//   const secretKey = process.env.SECRETKEY;
//   if (!secretKey) {
//     console.error('JWT secret key is not defined');
//     return res.status(500).json({ msg: 'JWT secret key is not defined' });
//   }
//   const cookies = cookie.parse(req.headers.cookie || '');
//   console.log('jsdodckj   ', req.headers);
//   const token = cookies.token;
//   console.log(token);
//   const { newPassword, oldPassword } = req.body;

//   try {
//     const decoded: any = jwt.verify(token, secretKey);
//     console.log('Decoded token:', decoded);

//     const id = decoded.id;
//     console.log('User ID from token:', id);

//     const user = await UserModel.findById(id);
//     console.log('User from database:', user);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ msg: 'Old password is incorrect' });
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedNewPassword;

//     const userEmail = user.email;

//     // Read HTML template from file
//     const templatePath = path.join(__dirname, '../utils/passwordchange.html');
//     let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
//     const a = user.companyName;
//     const htmlContent = htmlTemplate.replace('{{name}}', a);

//     // Send confirmation email
//     await sendEmailAdmin(
//       userEmail,
//       'Password Changed Successfully',
//       'Your password has been changed successfully.',
//       htmlContent
//     );

//     await user.save();
//     res.status(200).json({ msg: 'Password changed successfully' });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ msg: 'Internal server error6' });
//   }
// };

export const changeforgotpass = async (req: Request, res: Response) => {
  console.log('djeodjopkpk');
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }
  const { token, password } = req.body;

  try {
    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const email = decoded.email;
    console.log('User email from token:', email);

    const user = await UserModel.findOne({ email: email });
    console.log('User from database:', user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);
    user.password = hashedNewPassword;

    const userEmail = user.email;

    const templatePath = path.join(__dirname, '../utils/passwordchange.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const companyName = user.companyName;
    const htmlContent = htmlTemplate.replace('{{name}}', companyName);

    await sendEmailAdmin(
      userEmail,
      'Password Changed Successfully',
      'Your password has been changed successfully.',
      htmlContent
    );
    await user.save();
    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      console.error('Token has expired:', e.message);
      return res.status(401).json({ msg: 'Token has expired' });
    } else if (e instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', e.message);
      return res.status(401).json({ msg: 'Invalid token' });
    } else {
      console.error('Error during password change:', e);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const token = jwt.sign(
      { email: email }, // Minimized payload
      secretKey, // Keep the key secure, consider its length if appropriate
      { algorithm: 'HS384', expiresIn: '5m' } // Token expires in 3 minutes
    );

    const link = `https://www.603thecoworkingspace.com/changepassword/${token}`;
    const templatePath = path.join(__dirname, '../utils/forgotpass.html');

    // Read HTML template
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders in template
    const htmlContent = htmlTemplate
      .replace('{{name}}', email)
      .replace('{{link}}', link); // Ensure 'link' is used here

    // Send confirmation email
    await sendEmailAdmin(
      email,
      'Password Reset Request',
      'Please use the link below to reset your password.',
      htmlContent
    );

    return res
      .status(200)
      .json({ msg: 'Password reset link sent successfully!' });
  } catch (error) {
    console.error('Error in forgotPassword function:', error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

// Function to update a user
export const updateuser = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Token is missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded: any = jwt.verify(token, secretKey);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { companyName, country, state, city, zipCode } = req.body;

    user.companyName = companyName;
    user.country = country;
    user.state = state;
    user.city = city;
    user.zipcode = zipCode;

    await user.save();

    res.status(200).json({ msg: 'User updated' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
// export const updateuser = async (req: Request, res: Response) => {
//   const secretKey = process.env.SECRETKEY;
//   if (!secretKey) {
//     console.error('JWT secret key is not defined');
//     return res.status(500).json({ msg: 'JWT secret key is not defined' });
//   }
//   try {
//     const cookies = cookie.parse(req.headers.cookie || '');
//     console.log('jsdodckj   ', req.headers);
//     const token = cookies.token;
//     console.log(token);
//     const { companyName, country, state, city, zipCode } = req.body;
//     const decoded: any = jwt.verify(token, secretKey);
//     const user = await UserModel.findById(decoded.id);

//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     user.companyName = companyName;
//     user.country = country;
//     user.state = state;
//     user.city = city;
//     user.zipcode = zipCode;

//     await user.save();

//     res.status(200).json({ msg: 'User updated' });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ msg: 'Internal server error' });
//   }
// };

export const updateuserbyadmin = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }
  try {
    const {
      companyName,
      location,
      kyc,
      phone,
      email,
      role,
      monthlycredits,
      extracredits,
      creditsleft,
      id,
    } = req.body;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.companyName = companyName;
    user.email = email;
    user.phone = phone;
    user.kyc = kyc;
    user.monthlycredits = monthlycredits;
    user.creditsleft = creditsleft;
    user.location = location;
    user.extracredits = extracredits;
    user.role = role;

    await user.save();

    res.status(200).json({ msg: 'User updated' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ msg: 'Internal server error26' });
  }
};

export const deleteuserbyadmin = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }
  try {
    const { id } = req.body;
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: 'User deleted' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ msg: 'Internal server error26' });
  }
};

export const allusersbyadmin = async (req: Request, res: Response) => {
  try {
    const totalUsers = await UserModel.find({ role: 'user' }).sort({
      createdAt: -1,
    });
    const totaladmin = await UserModel.find({ role: 'admin' }).sort({
      createdAt: -1,
    });

    const allworkspaces = await SpaceModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      msg: 'details',
      totalUsers,
      totaladmin,
      allworkspaces,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

// Function to complete KYC for a user
export const dokyc = async (req: Request, res: Response) => {
  const {
    user,
    firstname,
    lastname,
    phone,
    address,
    pancard,
    aadhar,
    companyname,
  } = req.body;
  try {
    await kycmodel.create({
      user,
      firstname,
      lastname,
      phone,
      address,
      pancard,
      aadhar,
      companyname,
    });
    await UserModel.findOneAndUpdate({ name: user }, { kyc: true });
    res.status(200).json({ msg: 'KYC Completed' });
  } catch (e) {
    res.status(500).json({ msg: 'Internal server error9' });
  }
};

//get a user by admin account
export const getuserDetailsByAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    const getUser = await UserModel.findOne({ email: email });

    if (!getUser) {
      return res.status(404).json({ msg: 'user not found' });
    }

    res.status(200).json(getUser);
  } catch (error) {
    res.status(404).json({ msg: 'something went wrong' });
  }
};
