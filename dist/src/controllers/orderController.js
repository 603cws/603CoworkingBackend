"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdaypassesPaymentDatabase = exports.createBookingPaymentDatabase = exports.refundcallback = exports.refund = exports.phonepeCallback = exports.validate = exports.create = void 0;
// const Razorpay = require("razorpay");
const dotenv = require('dotenv');
const crypto = require('crypto');
const uniqid = require('uniqid');
const zohoController_1 = require("./zohoController");
const axios_1 = __importDefault(require("axios"));
const date_fns_tz_1 = require("date-fns-tz");
// const {
//   validateWebhookSignature,
// } = require("razorpay/dist/utils/razorpay-utils");
const booking_model_1 = require("../models/booking.model");
// import { createBooking } from "../controllers/bookingControllers";
const space_model_1 = require("../models/space.model");
const emailUtils_1 = require("../utils/emailUtils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Daypassbookingmodel_1 = require("../models/Daypassbookingmodel");
const payment_model_1 = require("../models/payment.model");
const user_model_1 = require("../models/user.model");
const cancelledBooking_model_1 = require("../models/cancelledBooking.model");
// import { checkTimeOverlap } from "../controllers/bookingControllers";
//configure
dotenv.config();
// let amountPerBooking =
//   booking.price +
//   booking.price * 0.18 -
//   booking.price * (discountPercentage / 100);
//processing booking in db and payment in db
const processBookings = async (bookings, userID, paymentMethod, paymentDetails, merchantTransactionId, discountPercentage) => {
    try {
        const now = new Date();
        const timeZone = 'Asia/Kolkata';
        const zonedTime = (0, date_fns_tz_1.toZonedTime)(now, timeZone); // Adjust timezone
        const currentTimeinHrandMin = (0, date_fns_tz_1.format)(zonedTime, 'HH:mm', { timeZone });
        console.log('currenttimeinhrsnmin', currentTimeinHrandMin); // Outputs time in 24-hour format
        const userDetails = await user_model_1.UserModel.findById(userID);
        // Use Promise.all to wait for all async operations to complete
        const bookingResults = await Promise.all(bookings.map(async (booking) => {
            // Find the location
            const loc = await space_model_1.SpaceModel.findOne({ name: booking.spaceName });
            if (!loc) {
                throw new Error('Location not found');
            }
            //booking price with discount
            let prebill = booking.price - booking.price * (discountPercentage / 100);
            let bill = +prebill.toFixed(2);
            //
            let amountPerBooking = bill + bill * 0.18;
            const newBooking = new booking_model_1.BookingModel({
                user: userDetails?._id,
                space: loc._id,
                companyName: userDetails?.companyName,
                spaceName: loc.name,
                location: loc.location,
                startTime: booking.startTime,
                endTime: booking.endTime,
                date: booking.date,
                paymentMethod,
                transactionAmount: amountPerBooking.toFixed(2),
                status: paymentDetails.state,
                transactionId: merchantTransactionId,
                transactionTIme: currentTimeinHrandMin,
            });
            const storeBooking = await newBooking.save();
            console.log(storeBooking);
            // Store payment
            const newPayment = new payment_model_1.PaymentModel({
                user: userDetails?._id,
                booking: storeBooking._id,
                // amount: paymentDetails.amount / (TotalBookings * 100),
                amount: amountPerBooking.toFixed(2),
                status: paymentDetails?.state,
                userName: userDetails?.username,
                email: userDetails?.email,
                paymentMethod,
                paymentId: paymentDetails.transactionId,
            });
            const storePayment = await newPayment.save();
            console.log(storePayment);
            //store the booking on the zoho
            const zohobooking = await (0, zohoController_1.createBookingOnZohoOnlinePay)(userID, booking);
            const userEmail = userDetails?.email || ' ';
            // Read HTML template from file
            const templatePath = path_1.default.join(__dirname, '../utils/email.html');
            let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
            // Replace placeholders with actual values
            const htmlContent = htmlTemplate
                .replace('{{name}}', userDetails?.companyName || ' ')
                .replace('{{startTime}}', booking.startTime)
                .replace('{{endTime}}', booking.endTime)
                .replace('{{place}}', loc.name)
                .replace('{{date}}', booking.date);
            // Send confirmation email
            await (0, emailUtils_1.sendEmailAdmin)(userEmail, 'Booking Confirmation', 'Your room booking at 603 Coworking Space has been successfully confirmed.', htmlContent);
            // return storeBooking;
        }));
        // // After all bookings are processed, send a response
        // res.status(201).json(bookingResults);
    }
    catch (error) {
        console.log(error);
        // res.status(404).json({
        //   message: 'something went wrong creating booking &storing ',
        //   error,
        // });
    }
};
//processing daypass in db and payment in db
// Assuming you want to map through the bookings and process each one
const processDaypasses = async (daypasses, userID, paymentMethod, paymentDetails, merchantTransactionId, discountPercentage) => {
    try {
        const now = new Date();
        // Extract time components
        const hours = now.getHours(); // 0-23
        const minutes = now.getMinutes(); // 0-59
        // Use Promise.all to wait for all async operations to complete
        const dayPassResults = await Promise.all(daypasses.map(async (daypass) => {
            // Find the location
            const loc = await space_model_1.SpaceModel.findOne({ name: daypass.spaceName });
            if (!loc) {
                throw new Error('Location not found');
            }
            const userDetails = await user_model_1.UserModel.findById(userID);
            //booking price with discount
            let prebill = daypass.price - daypass.price * (discountPercentage / 100);
            //fixing the decimal to 2 digit
            let bill = +prebill.toFixed(2);
            //calculate gst on the bill
            let amountPerdaypas = bill + bill * 0.18;
            const newDaypass = new Daypassbookingmodel_1.DayPass({
                space: loc?._id,
                companyName: userDetails?.companyName,
                user: userDetails?._id,
                email: userDetails?.email,
                spaceName: loc?.name,
                phone: userDetails?.phone,
                bookeddate: daypass.bookeddate,
                date: daypass.bookeddate,
                day: daypass.day,
                month: daypass.month,
                year: daypass.year,
                status: paymentDetails.state,
                paymentMethod,
                transactionId: merchantTransactionId,
                transactionTIme: `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}`,
                transactionAmount: amountPerdaypas.toFixed(2),
                quantity: daypass.quantity,
            });
            //update the space available daypass
            //get the space from the space model
            // const getspace = await SpaceModel.findOne({
            //   spaceName: daypass.spaceName,
            // });
            // await SpaceModel.findOneAndUpdate({ spaceName: daypass.spaceName },{availableCapacity});
            const updatedSpace = await space_model_1.SpaceModel.findOneAndUpdate({ name: daypass.spaceName }, // Filter
            { $inc: { availableCapacity: -daypass.quantity } }, // increment
            { new: true, runValidators: true } // Return the updated document
            );
            const storeDaypass = await newDaypass.save();
            console.log(storeDaypass);
            // Store payment
            const newPayment = new payment_model_1.PaymentModel({
                user: userDetails?._id,
                daypasses: storeDaypass._id,
                // amount: paymentDetails.amount / (Totaldaypass * 100),
                amount: amountPerdaypas,
                status: paymentDetails.status,
                userName: userDetails?.username,
                email: userDetails?.email,
                paymentMethod,
                paymentId: paymentDetails.transactionId,
            });
            const storePayment = await newPayment.save();
            console.log(storePayment);
            const userEmail = userDetails?.email || '';
            // Read HTML template from file
            const templatePath = path_1.default.join(__dirname, '../utils/daypassEmail.html');
            console.log(templatePath);
            let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
            // Replace placeholders with actual values
            const a = userDetails?.companyName || '';
            const htmlContent = htmlTemplate
                .replace('{{name}}', a)
                .replace('{{place}}', daypass.spaceName)
                .replace('{{date}}', daypass.bookeddate);
            await (0, emailUtils_1.sendEmailAdmin)(userEmail, 'Booking Confirmation', 'Your dayPass booking at 603 Coworking Space has been successfully confirmed.', htmlContent);
            // return storeDaypass;
        }));
        // After all daypass are processed, send a respons
    }
    catch (error) {
        console.log(error);
    }
};
//integrate phonepe
//test credentials
// const MERCHANT_KEY = '96434309-7796-489d-8924-ab56988a6076';
// const MERCHANT_ID = 'PGTESTPAYUAT86';
// const MERCHANT_BASE_URL =
//   'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
// const MERCHANT_STATUS_URL =
//   'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status';
// // const redirectUrl = 'http://127.0.0.1:3000/api/v1/order/status';
// const redirectUrl = 'https://603-coworking-backend.vercel.app/api/v1/order/status';
// // const successUrl = 'http://localhost:5173/dashboard';
// const successUrl = 'https://www.603thecoworkingspace.com/dashboard';
// // const failureUrl = 'http://localhost:5173/payment';
// const failureUrl = 'https://www.603thecoworkingspace.com/payment';
// const refundUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund`;
//prod credentials
const MERCHANT_KEY = process.env.MERCHANT_KEY;
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_BASE_URL = process.env.MERCHANT_BASE_URL;
const MERCHANT_STATUS_URL = process.env.MERCHANT_STATUS_URL;
const redirectUrl = process.env.REDIRECTURL;
const refundUrl = process.env.REFUNDURL;
const successUrl = process.env.SUCCESSFULURL;
const failureUrl = process.env.FAILUREURL;
const create = async (req, res) => {
    const { accHolder, amount, bookings, dayPasses, discountPercentage } = req.body;
    console.log(req.body);
    const orderId = uniqid();
    const mobileNumber = accHolder.phone;
    //payment
    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: accHolder._id,
        mobileNumber: mobileNumber,
        amount: amount * 100,
        merchantTransactionId: orderId,
        redirectUrl: `${redirectUrl}/?id=${orderId}&bookings=${encodeURIComponent(JSON.stringify(bookings))}&daypasses=${encodeURIComponent(JSON.stringify(dayPasses))}&userID=${accHolder._id}&amount=${amount}&discountPercentage=${discountPercentage}`,
        redirectMode: 'REDIRECT',
        paymentInstrument: {
            type: 'PAY_PAGE',
        },
    };
    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
    const option = {
        method: 'POST',
        url: MERCHANT_BASE_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
        },
        data: {
            request: payload,
        },
    };
    try {
        const response = await axios_1.default.request(option);
        console.log(response.data.data.instrumentResponse.redirectInfo.url);
        res.status(200).json({
            msg: 'OK',
            url: response.data.data.instrumentResponse.redirectInfo.url,
        });
    }
    catch (error) {
        console.log('error in payment', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};
exports.create = create;
const validate = async (req, res) => {
    console.log('enter into the validate ');
    const merchantTransactionId = req.query.id;
    const userID = req.query.userID;
    const amount = req.query.amount;
    console.log(amount);
    const discountPercentage = req.query.discountPercentage;
    console.log('user id', userID);
    console.log(req.query);
    const bookingsRaw = req.query.bookings; // Encoded string
    const daypassesRaw = req.query.daypasses;
    const keyIndex = 1;
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
    console.log(checksum);
    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID,
        },
    };
    axios_1.default.request(option).then(response => {
        console.log(response.data);
        if (response.data.code === 'PAYMENT_SUCCESS') {
            const paymentMethod = response.data.data.paymentInstrument.type;
            const payment = response.data.data;
            if (bookingsRaw !== 'undefined') {
                const bookings = JSON.parse(decodeURIComponent(bookingsRaw));
                console.log(bookings);
                if (bookings.length !== 0) {
                    processBookings(bookings, userID, paymentMethod, payment, merchantTransactionId, discountPercentage);
                }
            }
            if (daypassesRaw !== 'undefined') {
                const daypasses = JSON.parse(decodeURIComponent(daypassesRaw));
                console.log(daypasses);
                if (daypasses.length !== 0) {
                    processDaypasses(daypasses, userID, paymentMethod, payment, merchantTransactionId, discountPercentage);
                }
            }
            return res.redirect(`${successUrl}`);
        }
        else {
            return res.redirect(`${failureUrl}`);
        }
    });
};
exports.validate = validate;
const phonepeCallback = async (req, res) => {
    console.log('welcome to the callback url');
};
exports.phonepeCallback = phonepeCallback;
const refund = async (req, res) => {
    const { accHolder, bookingid, selectedTransaction } = req.body;
    console.log(req.body);
    const orderId = selectedTransaction.transactionId;
    const refundAmount = selectedTransaction.transactionAmount * 100;
    const refundTransactionID = uniqid();
    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: accHolder._id,
        originalTransactionId: orderId,
        merchantTransactionId: refundTransactionID,
        amount: refundAmount,
        callbackUrl: 'https://603-coworking-backend.vercel.app/api/v1/order/refundcallback',
    };
    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + '/pg/v1/refund' + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;
    const axios = require('axios');
    const options = {
        method: 'POST',
        url: refundUrl,
        headers: {
            accept: 'application/json',
            'Content-type': 'application/json',
            'X-VERIFY': checksum,
        },
        data: {
            request: payload,
        },
    };
    try {
        const response = await axios.request(options);
        const merchantTransactionId = response.data.data.merchantTransactionId;
        if ((response.data.code = 'PAYMENT_PENDING')) {
            const keyIndex = 1;
            const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
            const sha256 = crypto.createHash('sha256').update(string).digest('hex');
            const checksum = sha256 + '###' + keyIndex;
            console.log(checksum);
            const option = {
                method: 'GET',
                url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': MERCHANT_ID,
                },
            };
            const response = await axios.request(option);
            // console.log('check status of refund', response.data);
            //get booking from the booking db
            const meetOrConfBooking = await booking_model_1.BookingModel.findById(bookingid);
            //get daypass booking from the daypass db
            const daypassBooking = await Daypassbookingmodel_1.DayPass.findById(bookingid);
            //if meetorconfBooking is true
            if (meetOrConfBooking) {
                //get and update the booking to the status to refund
                const getbooking = await booking_model_1.BookingModel.findByIdAndUpdate(bookingid, { status: 'REFUND' }, { new: true, runValidators: true });
                console.log('bookingthatShouldbecancelled', getbooking);
                const getspace = await space_model_1.SpaceModel.findOne({
                    name: getbooking?.spaceName,
                });
                const storeBookingInCancelledDb = new cancelledBooking_model_1.CancelledBookingModel({
                    user: accHolder._id,
                    space: getspace?._id,
                    companyName: getbooking?.companyName,
                    spaceName: getbooking?.spaceName,
                    startTime: getbooking?.startTime,
                    endTime: getbooking?.endTime,
                    date: getbooking?.date,
                    creditsspent: getbooking?.creditsspent,
                    paymentMethod: getbooking?.paymentMethod,
                    status: getbooking?.status,
                    transactionAmount: getbooking?.transactionAmount,
                    transactionId: getbooking?.transactionId,
                    transactionTIme: getbooking?.transactionTIme,
                });
                await storeBookingInCancelledDb.save();
                await booking_model_1.BookingModel.findByIdAndDelete(getbooking?._id);
            }
            //if daypassbooking is true
            if (daypassBooking) {
                //get and update the booking to the status to refund
                const getbooking = await Daypassbookingmodel_1.DayPass.findByIdAndUpdate(bookingid, { status: 'REFUND' }, { new: true, runValidators: true });
                console.log('bookingthatShouldbecancelled', getbooking);
                const getspace = await space_model_1.SpaceModel.findOne({
                    name: getbooking?.spaceName,
                });
                const storeBookingInCancelledDb = new cancelledBooking_model_1.CancelledBookingModel({
                    user: accHolder._id,
                    space: getspace?._id,
                    companyName: getbooking?.companyName,
                    spaceName: getbooking?.spaceName,
                    startTime: getbooking?.startTime,
                    endTime: getbooking?.endTime,
                    date: getbooking?.date,
                    creditsspent: getbooking?.creditsspent,
                    paymentMethod: getbooking?.paymentMethod,
                    status: getbooking?.status,
                    transactionAmount: getbooking?.transactionAmount,
                    transactionId: getbooking?.transactionId,
                    transactionTIme: getbooking?.transactionTIme,
                    daypassQuantity: getbooking?.quantity,
                });
                //on refund inc the availablespace by quantity
                const updatedSpace = await space_model_1.SpaceModel.findOneAndUpdate({ name: getbooking?.spaceName }, // Filter
                { $inc: { availableCapacity: getbooking?.quantity } }, // increment
                { new: true, runValidators: true } // Return the updated document
                );
                await storeBookingInCancelledDb.save();
                await Daypassbookingmodel_1.DayPass.findByIdAndDelete(getbooking?._id);
            }
            res.status(200).json(response.data);
        }
    }
    catch (error) {
        console.log('error in payment', error.message);
        res
            .status(500)
            .json({ error: 'Failed to refund payment', errorMsg: error });
    }
};
exports.refund = refund;
const refundcallback = async (req, res) => {
    console.log('refund callback request');
};
exports.refundcallback = refundcallback;
//function to store multiple  booking and payment and send email to the user
const createBookingPaymentDatabase = async (req, res) => {
    const { bookings, userDetails, paymentMethod, paymentDetails, paymentId } = req.body;
    console.log(req.body);
    //get the lenght of the array
    const TotalBookings = bookings.length + 1;
    // Assuming you want to map through the bookings and process each one
    const processBookings = async (bookings) => {
        try {
            // Use Promise.all to wait for all async operations to complete
            const bookingResults = await Promise.all(bookings.map(async (booking) => {
                // Find the location
                const loc = await space_model_1.SpaceModel.findOne({ name: booking.spaceName });
                if (!loc) {
                    throw new Error('Location not found');
                }
                const newBooking = new booking_model_1.BookingModel({
                    user: userDetails._id,
                    space: loc._id,
                    companyName: userDetails.companyName,
                    spaceName: loc.name,
                    location: loc.location,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    date: booking.date,
                    paymentMethod,
                    status: paymentDetails.status,
                });
                const storeBooking = await newBooking.save();
                console.log(storeBooking);
                let amountPerBooking = booking.price + booking.price * 0.18;
                // Store payment
                const newPayment = new payment_model_1.PaymentModel({
                    user: userDetails._id,
                    booking: storeBooking._id,
                    // amount: paymentDetails.amount / (TotalBookings * 100),
                    amount: amountPerBooking,
                    status: paymentDetails.status,
                    userName: userDetails.username,
                    email: userDetails.email,
                    paymentMethod,
                    paymentId,
                });
                const storePayment = await newPayment.save();
                console.log(storePayment);
                const userEmail = userDetails.email;
                // Read HTML template from file
                const templatePath = path_1.default.join(__dirname, '../utils/email.html');
                let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
                // Replace placeholders with actual values
                const htmlContent = htmlTemplate
                    .replace('{{name}}', userDetails.companyName)
                    .replace('{{startTime}}', booking.startTime)
                    .replace('{{endTime}}', booking.endTime)
                    .replace('{{place}}', loc.name)
                    .replace('{{date}}', booking.date);
                // Send confirmation email
                await (0, emailUtils_1.sendEmailAdmin)(userEmail, 'Booking Confirmation', 'Your room booking at 603 Coworking Space has been successfully confirmed.', htmlContent);
                return storeBooking;
            }));
            // After all bookings are processed, send a response
            res.status(201).json(bookingResults);
        }
        catch (error) {
            console.log(error);
            res.status(404).json({
                message: 'something went wrong creating booking &storing ',
                error,
            });
        }
    };
    processBookings(bookings);
};
exports.createBookingPaymentDatabase = createBookingPaymentDatabase;
//mutiple booking for daypasses
const createdaypassesPaymentDatabase = async (req, res) => {
    const { daypasses, paymentDetails, paymentMethod, userDetails, paymentId } = req.body;
    //get space id
    console.log(req.body);
    // Assuming you want to map through the bookings and process each one
    const processDaypasses = async (daypasses) => {
        try {
            // Use Promise.all to wait for all async operations to complete
            const dayPassResults = await Promise.all(daypasses.map(async (daypass) => {
                // Find the location
                const loc = await space_model_1.SpaceModel.findOne({ name: daypass.spaceName });
                if (!loc) {
                    throw new Error('Location not found');
                }
                const newDaypass = new Daypassbookingmodel_1.DayPass({
                    space: loc?._id,
                    companyName: userDetails.companyName,
                    user: userDetails._id,
                    email: userDetails.email,
                    spaceName: loc?.name,
                    phone: userDetails.phone,
                    bookeddate: daypass.bookeddate,
                    date: daypass.bookeddate,
                    day: daypass.day,
                    month: daypass.month,
                    year: daypass.year,
                    status: paymentDetails.status,
                    paymentMethod,
                });
                const storeDaypass = await newDaypass.save();
                console.log(storeDaypass);
                let amountPerdaypas = daypass.price + daypass.price * 0.18;
                // Store payment
                const newPayment = new payment_model_1.PaymentModel({
                    user: userDetails._id,
                    daypasses: storeDaypass._id,
                    // amount: paymentDetails.amount / (Totaldaypass * 100),
                    amount: amountPerdaypas,
                    status: paymentDetails.status,
                    userName: userDetails.username,
                    email: userDetails.email,
                    paymentMethod,
                    paymentId,
                });
                const storePayment = await newPayment.save();
                console.log(storePayment);
                const userEmail = userDetails.email;
                // Read HTML template from file
                const templatePath = path_1.default.join(__dirname, '../utils/daypassEmail.html');
                console.log(templatePath);
                let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
                // Replace placeholders with actual values
                const a = userDetails.companyName;
                const htmlContent = htmlTemplate
                    .replace('{{name}}', a)
                    .replace('{{place}}', daypass.spaceName)
                    .replace('{{date}}', daypass.bookeddate);
                await (0, emailUtils_1.sendEmailAdmin)(userEmail, 'Booking Confirmation', 'Your dayPass booking at 603 Coworking Space has been successfully confirmed.', htmlContent);
                return storeDaypass;
            }));
            // After all daypass are processed, send a response
            res.status(201).json(dayPassResults);
        }
        catch (error) {
            console.log(error);
            res.status(404).json({
                message: 'something went wrong creating daypasses &storing ',
                error,
            });
        }
    };
    processDaypasses(daypasses);
};
exports.createdaypassesPaymentDatabase = createdaypassesPaymentDatabase;
