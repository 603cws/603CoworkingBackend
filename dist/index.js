"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbconnect_1 = __importDefault(require("./src/utils/dbconnect"));
const dotenv_1 = __importDefault(require("dotenv"));
const BookingRoutes_1 = __importDefault(require("./src/routes/BookingRoutes"));
const AuthRoutes_1 = __importDefault(require("./src/routes/AuthRoutes"));
const UserRoutes_1 = __importDefault(require("./src/routes/UserRoutes"));
const ServiceRoute_1 = __importDefault(require("./src/routes/ServiceRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const SpaceRoute_1 = __importDefault(require("./src/routes/SpaceRoute"));
const creditRoute_1 = __importDefault(require("./src/routes/creditRoute"));
const cron_1 = require("./api/cron"); // Import your cron handler
const careerRoutes_1 = __importDefault(require("./src/routes/careerRoutes"));
const DayPassRoute_1 = __importDefault(require("./src/routes/DayPassRoute"));
const couponRoutes_1 = __importDefault(require("./src/routes/couponRoutes"));
const zohoRoutes_1 = __importDefault(require("./src/routes/zohoRoutes"));
const DayPassController_1 = require("./src/controllers/DayPassController");
const axios = require('axios');
//import order route
const OrderRoutes_1 = __importDefault(require("./src/routes/OrderRoutes"));
//morgan
// const morgan = require('morgan');
// //helmet
// const helmet = require('helmet');
//rate limiter
// const rateLimit = require('express-rate-limit');
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
// app.use(morgan('dev'));
// app.use(helmet());
//limit request from same api
// const limiter = rateLimit({
//   max: 100, //100 req per hour
//   windowMs: 15 * 60 * 1000,
//   message: 'Too many requests from this IP,please try again in an hour',
// });
// app.use('/api', limiter);
// 603-coworking-backend.vercel.app
const port = process.env.PORT || 3000;
// dotenv.config({ path: "backend/.env" });
dotenv_1.default.config({ path: './.env' });
(0, dbconnect_1.default)().catch(err => console.error('Database connection error:', err));
app.use(express_1.default.json());
let allowedOrigins;
//new chages made
allowedOrigins = [
    'https://www.603thecoworkingspace.com',
    'https://603-cws-frontend.vercel.app',
    'http://localhost:5173',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log('Request Origin:', origin);
        if (!origin || allowedOrigins.includes(origin) || origin === null) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use('api/v1/order/status', (0, cors_1.default)());
// app.use(cors()); // Allow all origins temporarily
app.get('/api/cron', cron_1.cronHandler);
app.use('/api/v1/services', ServiceRoute_1.default);
app.use('/api/v1/spaces', SpaceRoute_1.default);
app.use('/api/v1/bookings', BookingRoutes_1.default);
app.use('/api/v1/auth', AuthRoutes_1.default);
app.use('/api/v1/users', UserRoutes_1.default);
app.use('/api/v1/career', careerRoutes_1.default);
app.use('/api/v1/credits', creditRoute_1.default);
app.use('/api/v1/daypass', DayPassRoute_1.default);
app.use('/api/v1/zoho', zohoRoutes_1.default);
app.use('/api/v1/coupon', couponRoutes_1.default);
//payment route
app.use('/api/v1/order', OrderRoutes_1.default);
//temp data check
// app.use('/api/v1/marketdata',)
app.get('/', (req, res) => {
    console.log('Root URL accessed');
    res.send('Welcome to the API');
});
// Catch-all route for undefined routes
app.use((req, res) => {
    console.log('Undefined route accessed:', req.originalUrl);
    res.status(404).send('Route not found');
});
const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';
let { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REDIRECT_URL, ZOHO_AUTHORIZATION_CODE, ZOHO_REFRESH_TOKEN, } = process.env;
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
        const { access_token, refresh_token, expires_in, api_domain, token_type } = response.data;
        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);
        console.log('Expires In:', expires_in, 'seconds');
        console.log('API Domain:', api_domain);
        console.log('Token Type:', token_type);
        // ZOHO_REFRESH_TOKEN = response.data.refresh_token;
        // You can now use the access_token and store refresh_token for long-term use.
        return response.data;
    }
    catch (error) {
        console.error('Error exchanging authorization code:');
        throw error;
    }
};
// Call the function
// exchangeAuthorizationCode();
//call the scheduler function
(0, DayPassController_1.scheduleDayPassJob)();
// call the credits function
(0, cron_1.scheduleCreditsJob)();
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// module.exports = access_token;
