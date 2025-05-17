import express, { Request, Response } from 'express';
import cors from 'cors';
import dbconnect from './src/utils/dbconnect';
import dotenv from 'dotenv';
import BookingRoutes from './src/routes/BookingRoutes';
import AuthRoutes from './src/routes/AuthRoutes';
import UserRoutes from './src/routes/UserRoutes';
import ServiceRoutes from './src/routes/ServiceRoute';
import cookieParser from 'cookie-parser';
import SpaceRoutes from './src/routes/SpaceRoute';
import creditRoutes from './src/routes/creditRoute';
import { cronHandler, scheduleCreditsJob } from './api/cron'; // Import your cron handler
import careerRoutes from './src/routes/careerRoutes';
import daypassroutes from './src/routes/DayPassRoute';
import couponRoutes from './src/routes/couponRoutes';
import zohoRoutes from './src/routes/zohoRoutes';
import { scheduleDayPassJob } from './src/controllers/DayPassController';
const axios = require('axios');
//import order route
import orderRoutes from './src/routes/OrderRoutes';
//morgan
const morgan = require('morgan');
//helmet
const helmet = require('helmet');

//rate limiter
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());

//limit request from same api
const limiter = rateLimit({
  max: 100, //100 req per hour
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});
app.use('/api', limiter);

const port = process.env.PORT || 3000;

// dotenv.config({ path: "backend/.env" });
dotenv.config({ path: './.env' });
dbconnect().catch(err => console.error('Database connection error:', err));

app.use(express.json());

let allowedOrigins: string[];
//new chages made
allowedOrigins = [
  'https://www.603thecoworkingspace.com',
  'https://603-cws-frontend.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Request Origin:', origin);
      if (!origin || allowedOrigins.includes(origin) || origin === null) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use('api/v1/order/status', cors());
// app.use(cors()); // Allow all origins temporarily

app.get('/api/cron', cronHandler);
app.use('/api/v1/services', ServiceRoutes);
app.use('/api/v1/spaces', SpaceRoutes);
app.use('/api/v1/bookings', BookingRoutes);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/credits', creditRoutes);
app.use('/api/v1/daypass', daypassroutes);
app.use('/api/v1/zoho', zohoRoutes);
app.use('/api/v1/coupon', couponRoutes);

//payment route
app.use('/api/v1/order', orderRoutes);

//temp data check
// app.use('/api/v1/marketdata',)

app.get('/', (req: Request, res: Response) => {
  console.log('Root URL accessed');
  res.send('Welcome to the API');
});

// Catch-all route for undefined routes
app.use((req: Request, res: Response) => {
  console.log('Undefined route accessed:', req.originalUrl);
  res.status(404).send('Route not found');
});

const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

let {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URL,
  ZOHO_AUTHORIZATION_CODE,
  ZOHO_REFRESH_TOKEN,
} = process.env;

// let access_token =
//   "1000.e6bfe755051b80fef105b6815e0307c0.13bd1cdd2c1ae762d59ba693ae5cb542";

// Function to exchange the authorization code for an access token
const exchangeAuthorizationCode = async () => {
  try {
    const response = await axios.post(ZOHO_TOKEN_URL, null, {
      params: {
        grant_type: 'authorization_code',
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        redirect_uri: ZOHO_REDIRECT_URL,
        code: ZOHO_AUTHORIZATION_CODE,
        state: 'zzz',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log(response.data);

    const { access_token, refresh_token, expires_in, api_domain, token_type } =
      response.data;

    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires In:', expires_in, 'seconds');
    console.log('API Domain:', api_domain);
    console.log('Token Type:', token_type);

    // ZOHO_REFRESH_TOKEN = response.data.refresh_token;

    // You can now use the access_token and store refresh_token for long-term use.
    return response.data;
  } catch (error) {
    console.error('Error exchanging authorization code:');
    throw error;
  }
};

// Call the function
// exchangeAuthorizationCode();

//call the scheduler function
scheduleDayPassJob();

// call the credits function
scheduleCreditsJob();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// module.exports = access_token;
