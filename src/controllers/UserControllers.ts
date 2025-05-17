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

const Users = [
  {
    companyName: 'VAIBHAV BHAGAT',
    email: 'Romov6819@gmail.com',
    phone: 9869045111,
  },
  {
    companyName: 'DIRBY RAYMOND RODRIGUES',
    email: 'Shaneproperties@outlook.com',
    phone: 9082405701,
  },
  {
    companyName: 'SEED GLOBAL EDUCATION SERVICES PVT LTD',
    email: 'sharang@seedglobaleducation.com',
    phone: 9920204476,
  },
  {
    companyName: 'KAPCO BANQUETS AND CATERING',
    email: 'shailendra.jain@kapcocatering.com',
    phone: 9033810411,
  },
  {
    companyName: 'BUSY INFOTECH PVT LTD',
    email: 'ruchir@busy.in',
    phone: 9820201094,
  },
  {
    companyName: 'DELUXE CATERERS PVT LTD',
    email: 'vijay.sarkale@charcoalconepts.com',
    phone: 9850850384,
  },
  {
    companyName: 'VIHANG DESAI',
    email: 'vihang1987@gmail.com',
    phone: 9769497289,
  },
  {
    companyName: 'MAGADH CAPITAL ADVISORS',
    email: 'vipul.prasad@magadhcapital.com',
    phone: 9821627938,
  },
  {
    companyName: 'SOFRITEK PRIVATE LIMITED',
    email: 'KALPESH.RUPAREL@SOFRITEK',
    phone: 9820501222,
  },
  {
    companyName: 'ROHIT SAKPAL',
    email: 'rohitsakpal@anritsu.com',
    phone: 7738783977,
  },
  {
    companyName: 'SYNTELLECT INDIA',
    email: 'karthikeyan.moonpanar@syntellect.com',
    phone: 9167879705,
  },
  {
    companyName: 'MILIND ELECTRICALS PVT LTD',
    email: 'milind.electricals@gmail.com',
    phone: 9833174424,
  },
  {
    companyName: 'THIRTY ONE ENTERTAINMENT LLP',
    email: 'CHANDRABHAN@THIRTYONE.CO.IN',
    phone: 9930941411,
  },
  {
    companyName: 'NILFISK INDIA PVT LTD',
    email: 'ajain@nilfish.com',
    phone: 9987768565,
  },
  {
    companyName: 'ENHANCE IT',
    email: 'AnChatterjee@enhanceit.com',
    phone: 9916916000,
  },
  {
    companyName: 'RAHUL MORE',
    email: 'rahulmore14@gmail.com',
    phone: 9821342170,
  },
  {
    companyName: 'RESTAVERSE PVT LTD',
    email: 'charmi@restaverse.com',
    phone: 8879729723,
  },
  {
    companyName: 'FG GLASS INDUSTRIES PVT LTD',
    email: 'hrd.ho@fgglass.com',
    phone: 7506048325,
  },
  {
    companyName: 'ALSIRAAT CARS',
    email: 'alsiraatteam@gmail.com',
    phone: 7777089185,
  },
  {
    companyName: 'EXCELLITEK CONSULTING SERVICES PVT LTD',
    email: 'AnChatterjee@enhanceit.com',
    phone: 9916916000,
  },
  {
    companyName: 'CREDO',
    email: 'Farzeen@anotheridea.in',
    phone: 9821695885,
  },
  {
    companyName: 'EDHAS TRADING LLP(BRAND FITSHEETS)',
    email: 'director@edhasglobal.com',
    phone: 8770119532,
  },
  {
    companyName: 'DERIVATIVE TRADING ACADEMY',
    email: 'Vinay@derivativetradingacademy.com',
    phone: 9769943216,
  },
  {
    companyName: 'GROUND ZERO CONSULTING OPC PVT LTD',
    email: 'rahul@brandingedgestrategics.com',
    phone: 9009830767,
  },
  {
    companyName: 'ARHAMANYA VENTURES PVT LTD',
    email: 'kunalmehta@arhamlabs.com',
    phone: 9619671093,
  },
  {
    companyName: 'PROGRIZ COE PVT LTD',
    email: 'AnChatterjee@enhanceit.com',
    phone: 9916916000,
  },
  {
    companyName: 'AATMAN PRAGYAM ADVISORS',
    email: 'aatmanadvisors@gmail.com',
    phone: 9920740444,
  },
  {
    companyName: 'TRINE CONSULTING',
    email: 'Aditi.gupta@trinepartners.in',
    phone: 9429199021,
  },
  {
    companyName: 'Invest Reality',
    email: 'shraddhainvestin@gmail.com',
    phone: 8356027330,
  },
  {
    companyName: 'Talent Link',
    email: 'Snehanm.talentlink@gmail.com',
    phone: 8291327054,
  },
  {
    companyName: 'MPS Finvest',
    email: 'mpsfinvest@gmail.com',
    phone: 9820890409,
  },
  {
    companyName: 'TMT Law',
    email: 'Pritish.sahoo@tmtlaw.co.in',
    phone: 7045180545,
  },
  {
    companyName: 'Bhagat Tarachand',
    email: 'Vishal@bhagattarachand.com',
    phone: 9920128414,
  },
  {
    companyName: 'Senora Asset Management',
    email: 'mridul@senoraassetmanagement',
    phone: 9833448078,
  },
  {
    companyName: 'BINAL',
    email: 'binal@rosadogems.com',
    phone: 9455438290,
  },
  {
    companyName: 'SUCHIR MATHUR',
    email: 'suchir.mathur@gmail.com',
    phone: 7010358461,
  },
  {
    companyName: 'BREATHE CAREERS AND CONSULTING',
    email: 'krgbalan@hotmail.com',
    phone: 9930152864,
  },
  {
    companyName: 'SWIFT SKY',
    email: 'vaibhav@swiftsky.co',
    phone: 9819982597,
  },
  {
    companyName: 'Netcore Cloud',
    email: 'jinal.choksi@netcorecloud.com',
    phone: 9594541063,
  },
  {
    companyName: 'Vichakshan Fondation',
    email: 'corporate@vichakshan.org',
    phone: 7720080008,
  },
  {
    companyName: 'Eureka Forbes',
    email: 'Gurjyoti.saluja@eurekaforbes.com',
    phone: 9820259413,
  },
  {
    companyName: 'RIPPLE LINKS',
    email: 'nirav@ripplelinks.com',
    phone: 9820276279,
  },
  {
    companyName: 'RUPEE FUNDING',
    email: 'abhinav@rupeefunding.com',
    phone: 9884229991,
  },
  {
    companyName: 'BhaSha Advisors',
    email: 'bhavin@bhashaaadvisors.com',
    phone: 9819133493,
  },
  {
    companyName: 'DOMO REAL ESTATE',
    email: 'info@domorealestate.in',
    phone: 9410100888,
  },
  {
    companyName: 'RNC Valuecon LLP',
    email: 'bd@rakeshnarula.com',
    phone: 9924147022,
  },
  {
    companyName: 'Nucleus Software',
    email: 'Neelam.gupta@nucleussoftware.com',
    phone: 9820451173,
  },
  {
    companyName: 'Looqus Media Private Limited',
    email: 'rushabh@looqus.com',
    phone: 9987899897,
  },
  {
    companyName: 'Tarun Global',
    email: 'Tarun@jainglobal.co.in',
    phone: 9022906674,
  },
  {
    companyName: 'Amit Badala',
    email: 'amitbadala07@gmail.com',
    phone: 9870758470,
  },
  {
    companyName: 'Nuventis Technology LLP',
    email: 'nssanghvi90@gmail.com',
    phone: 9773513810,
  },
  {
    companyName: 'Urban Rider Ltd',
    email: 'amey220.tawte@gmail.com',
    phone: 9082465204,
  },
  {
    companyName: 'Sunrise light Ventures',
    email: 'sunriselightventures3@gmail.com',
    phone: 8879311135,
  },
  {
    companyName: 'Indiam Finance',
    email: 'shalabh@indiumfinance.com',
    phone: '9820980121',
  },
  {
    companyName: 'Anvayins',
    email: 'nishi.daas@anvayins.com',
    phone: 9820852549,
  },
  {
    companyName: 'CSR Box',
    email: 'lakshana@csrbox.org',
    phone: '',
  },
  {
    companyName: 'Bennett Coleman',
    email: 'alstan.rebello@timesgroup.com',
    phone: 9820557686,
  },
  {
    companyName: 'COX & KINGS',
    email: 'pramod.pawar@coxandkings.com',
    phone: '9820349065',
  },
  {
    companyName: 'Raheja Universal',
    email: 'adrina.coutinho@rahejauniversal.com',
    phone: 9920905951,
  },
  {
    companyName: 'PROJECT ARCI LEARNING INDIA LLP',
    email: 'rishi.mehta99@gmail.com',
    phone: 9326379581,
  },
  {
    companyName: 'Swapnil More',
    email: '360spm@gmail.com',
    phone: 8879404320,
  },
  {
    companyName: 'IREP CREDIT CAPITAL PVT LTD',
    email: 'anilnayak@irepglobal.com',
    phone: '8169408561',
  },
  {
    companyName: 'Finman Capital',
    email: 'accounts@finmancaps.com',
    phone: '9920248864',
  },
  {
    companyName: 'Quantum Four Analytics LLP',
    email: 'niyoti@quantumfour.com',
    phone: '8097000736',
  },
  {
    companyName: 'PRAGMATIC INTELLIGENCE AND ANALYTICS LLP',
    email: 'pravinjaiswalpi@gmal.com',
    phone: '9167245337',
  },
  {
    companyName: 'Ariyona Interior',
    email: 'Rittika@ariyonainterior.com',
    phone: '9820439191',
  },
  {
    companyName: 'Signaturewall Building System Pvt Ltd',
    email: 'salessignaturewall@gmail.com',
    phone: '8169372426',
  },
  {
    companyName: 'SUNRISE LIGHT VENTURE',
    email: 'sunriselightventures3@gmail.com',
    phone: '8879311135',
  },
  {
    companyName: 'ExtraMile Engagement Private Ltd',
    email: 'pooja@extramile.in',
    phone: '9820308784',
  },
  {
    companyName: 'Beyond Blendz Derma Pvt Ltd',
    email: 'Neha@beyondblendz.com',
    phone: '',
  },
  {
    companyName: 'Printofy Private Limited',
    email: 'vipul@printofy.in',
    phone: 9999033600,
  },
  {
    companyName: 'Sakshi Infotech Solutions LLP',
    email: 'amitkumar.sankhe@sakshiinfotech.com',
    phone: 9821110939,
  },
  {
    companyName: 'Athenaeum Transformation Services LLP',
    email: 'amitkumar.sankhe@sakshiinfotech.com',
    phone: 9821110939,
  },
  {
    companyName: 'Phenomenal studio LLP',
    email: 'kokas@phenomenal.biz / kokas@phenomenal.biz',
    phone: 7738522126,
  },
  {
    companyName: 'TSN Expert Services Private Limited',
    email: 'mihir@lynkpeople.com',
    phone: 8806745100,
  },
  {
    companyName: 'Metamark',
    email: 'charles.ingles@metamark.co.uk',
    phone: 8828321981,
  },
  {
    companyName: 'Frodoh Business Solutions Pvt Ltd',
    email: 'Russhabh@frodoh.world',
    phone: 9821839797,
  },
  {
    companyName: 'One Leap Solutions',
    email: 'nikkhil.narang@oneleap.in',
    phone: 9819998115,
  },
  {
    companyName: 'Trichambers',
    email: 'shivanibagdai@trichambers.com',
    phone: 9687614880,
  },
  {
    companyName: 'Dhiren kewlani',
    email: 'kewlanidhiren@hotmail.com',
    phone: 9833225536,
  },
  {
    companyName: 'Deepak Singh',
    email: 'admin@fastinfo.com',
    phone: 7415641372,
  },
  {
    companyName: 'Candi solar',
    email: 'neetu@candi.solar',
    phone: '',
  },
  {
    companyName: 'Travel Post',
    email: 'nasrulla@efh.co.in',
    phone: 9820544455,
  },
  {
    companyName: 'Butterfly Communications',
    email: 'devnani.ritu@gmail.com',
    phone: 9820534456,
  },
  {
    companyName: 'Venon Hospitality',
    email: 'akshaye@venonhospitality.com',
    phone: 9158000156,
  },
  {
    companyName: 'Mind share foundation',
    email: 'himanshu.patil@themindshare.in',
    phone: 9740977271,
  },
  {
    companyName: 'Dhirendra group',
    email: 'sanjay.verma@dhirendragroup.com',
    phone: 9999991015,
  },
  {
    companyName: 'The Money Market',
    email: 'abhishekmalli782@gmail.com',
    phone: '90826 84779',
  },
  {
    companyName: 'GCL International Assessment Private Limited',
    email: 'bunny_azmi@yahoo.co.in',
    phone: 7763807501,
  },
];

// Function to update users
const updateUsers = async (
  Users: Array<{ companyName: string; email: string; phone: number | string }>
) => {
  try {
    for (const user of Users) {
      // Check if the user exists
      const existingUser = await UserModel.findOne({ email: user.email });
      if (existingUser) {
        // Update the user if found
        await UserModel.updateOne(
          { email: user.email },
          {
            $set: {
              companyName: user.companyName,
              phone: user.phone,
              member: true,
            },
          }
        );
        console.log(`Updated user with email: ${user.email}`);
      } else {
        console.log(
          `No matching user found for email: ${user.email}, skipping...`
        );
      }
    }
    console.log('User update process completed');
  } catch (error) {
    console.error('Error updating users:', error);
  }
};

// Main execution
const main = async () => {
  await updateUsers(Users);
};

// main();

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
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('jsdodckj   ', req.headers);
    const token = cookies.token;
    console.log(token);

    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const id = decoded.id;
    console.log('User ID from token:', id);

    const user = await UserModel.findById(id);
    console.log('User from database:', user);
    if (!user) {
      return res.status(404).json({ msg: 'No such user' });
    }
    res.status(200).json({ user: user });
  } catch (e) {
    res.status(500).json({ msg: 'Internal server error2' });
  }
};

export const getuserdetails = async (req: Request, res: Response) => {
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('jsdodckj   ', req.headers);
    const token = cookies.token;
    console.log(token);
    if (!token) {
      return res.status(401).json({ msg: 'Token is missing' });
    }

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
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    const secretKey = process.env.SECRETKEY;

    if (!secretKey) {
      console.error('JWT secret key is not defined');
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }

    if (!token) {
      return res.status(401).json({ auth: false, user: 'user' });
    }

    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;

    if (decoded) {
      const getuser = await UserModel.findById(decoded.id);
      // Assuming user.role is the role you want to check
      return res
        .status(200)
        .json({ auth: true, user: decoded.role, accHolder: getuser });
    }
  } catch (error) {
    console.error('Error in authentication:', error);
    res
      .status(500)
      .json({ msg: 'Internal server error', auth: false, user: 'user' });
  }
};

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
  console.log('djeodjopkpk');
  const secretKey = process.env.SECRETKEY;
  if (!secretKey) {
    console.error('JWT secret key is not defined');
    return res.status(500).json({ msg: 'JWT secret key is not defined' });
  }
  const cookies = cookie.parse(req.headers.cookie || '');
  console.log('jsdodckj   ', req.headers);
  const token = cookies.token;
  console.log(token);
  const { newPassword, oldPassword } = req.body;

  try {
    const decoded: any = jwt.verify(token, secretKey);
    console.log('Decoded token:', decoded);

    const id = decoded.id;
    console.log('User ID from token:', id);

    const user = await UserModel.findById(id);
    console.log('User from database:', user);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
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
    const a = user.companyName;
    const htmlContent = htmlTemplate.replace('{{name}}', a);

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
    console.error(e);
    res.status(500).json({ msg: 'Internal server error6' });
  }
};

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
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('jsdodckj   ', req.headers);
    const token = cookies.token;
    console.log(token);
    const { companyName, country, state, city, zipCode } = req.body;
    const decoded: any = jwt.verify(token, secretKey);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

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
