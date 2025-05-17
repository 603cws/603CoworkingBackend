import { Request, Response } from 'express';
// const Razorpay = require("razorpay");
const dotenv = require('dotenv');
const crypto = require('crypto');
const uniqid = require('uniqid');
import { createBookingOnZohoOnlinePay } from './zohoController';
import axios from 'axios';
import { format, toZonedTime } from 'date-fns-tz';
// const {
//   validateWebhookSignature,
// } = require("razorpay/dist/utils/razorpay-utils");

import { BookingModel } from '../models/booking.model';
// import { createBooking } from "../controllers/bookingControllers";
import { SpaceModel } from '../models/space.model';
import { sendEmailAdmin } from '../utils/emailUtils';
import fs from 'fs';
import path from 'path';
import { DayPass } from '../models/Daypassbookingmodel';
import { PaymentModel } from '../models/payment.model';
import { UserModel } from '../models/user.model';
import { CancelledBookingModel } from '../models/cancelledBooking.model';
// import { checkTimeOverlap } from "../controllers/bookingControllers";

//configure
dotenv.config();

// let amountPerBooking =
//   booking.price +
//   booking.price * 0.18 -
//   booking.price * (discountPercentage / 100);

//processing booking in db and payment in db
const processBookings = async (
  bookings: any,
  userID: any,
  paymentMethod: any,
  paymentDetails: any,
  merchantTransactionId: any,
  discountPercentage: any
) => {
  try {
    //date
    // const now = new Date();

    // // Extract time components
    // const hours = new Date().getHours(); // 0-23
    // const minutes = new Date().getMinutes(); // 0-59

    // const currentTimeinHrandMin = `${hours
    //   .toString()
    //   .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const now = new Date();
    const timeZone = 'Asia/Kolkata';
    const zonedTime = toZonedTime(now, timeZone); // Adjust timezone
    const currentTimeinHrandMin = format(zonedTime, 'HH:mm', { timeZone });

    console.log('currenttimeinhrsnmin', currentTimeinHrandMin); // Outputs time in 24-hour format

    const userDetails = await UserModel.findById(userID);
    // Use Promise.all to wait for all async operations to complete

    const bookingResults = await Promise.all(
      bookings.map(async (booking: any) => {
        // Find the location
        const loc = await SpaceModel.findOne({ name: booking.spaceName });
        if (!loc) {
          throw new Error('Location not found');
        }

        //booking price with discount
        let prebill =
          booking.price - booking.price * (discountPercentage / 100);

        let bill = +prebill.toFixed(2);
        //
        let amountPerBooking = bill + bill * 0.18;

        const newBooking = new BookingModel({
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
        const newPayment = new PaymentModel({
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
        const zohobooking = await createBookingOnZohoOnlinePay(userID, booking);

        const userEmail = userDetails?.email || ' ';

        // Read HTML template from file
        const templatePath = path.join(__dirname, '../utils/email.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders with actual values
        const htmlContent = htmlTemplate
          .replace('{{name}}', userDetails?.companyName || ' ')
          .replace('{{startTime}}', booking.startTime)
          .replace('{{endTime}}', booking.endTime)
          .replace('{{place}}', loc.name)
          .replace('{{date}}', booking.date);

        // Send confirmation email
        await sendEmailAdmin(
          userEmail,
          'Booking Confirmation',
          'Your room booking at 603 Coworking Space has been successfully confirmed.',
          htmlContent
        );

        // return storeBooking;
      })
    );

    // // After all bookings are processed, send a response
    // res.status(201).json(bookingResults);
  } catch (error) {
    console.log(error);
    // res.status(404).json({
    //   message: 'something went wrong creating booking &storing ',
    //   error,
    // });
  }
};

//processing daypass in db and payment in db
// Assuming you want to map through the bookings and process each one
const processDaypasses = async (
  daypasses: any,
  userID: any,
  paymentMethod: any,
  paymentDetails: any,
  merchantTransactionId: any,
  discountPercentage: any
) => {
  try {
    const now = new Date();

    // Extract time components
    const hours = now.getHours(); // 0-23
    const minutes = now.getMinutes(); // 0-59
    // Use Promise.all to wait for all async operations to complete

    const dayPassResults = await Promise.all(
      daypasses.map(async (daypass: any) => {
        // Find the location
        const loc = await SpaceModel.findOne({ name: daypass.spaceName });
        if (!loc) {
          throw new Error('Location not found');
        }

        const userDetails = await UserModel.findById(userID);
        // let amountPerdaypas =
        //   daypass.price +
        //   daypass.price * 0.18 -
        //   daypass.price * (discountPercentage / 100);

        //booking price with discount
        let prebill =
          daypass.price - daypass.price * (discountPercentage / 100);

        //fixing the decimal to 2 digit
        let bill = +prebill.toFixed(2);
        //calculate gst on the bill
        let amountPerdaypas = bill + bill * 0.18;

        const newDaypass = new DayPass({
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

        const updatedSpace = await SpaceModel.findOneAndUpdate(
          { name: daypass.spaceName }, // Filter
          { $inc: { availableCapacity: -daypass.quantity } }, // increment
          { new: true, runValidators: true } // Return the updated document
        );

        const storeDaypass = await newDaypass.save();
        console.log(storeDaypass);

        // Store payment
        const newPayment = new PaymentModel({
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
        const templatePath = path.join(__dirname, '../utils/daypassEmail.html');
        console.log(templatePath);

        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders with actual values
        const a = userDetails?.companyName || '';
        const htmlContent = htmlTemplate
          .replace('{{name}}', a)
          .replace('{{place}}', daypass.spaceName)
          .replace('{{date}}', daypass.bookeddate);

        await sendEmailAdmin(
          userEmail,
          'Booking Confirmation',
          'Your dayPass booking at 603 Coworking Space has been successfully confirmed.',
          htmlContent
        );

        // return storeDaypass;
      })
    );

    // After all daypass are processed, send a respons
  } catch (error) {
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
const MERCHANT_KEY = '1ffdba94-b557-45f4-8b17-3d7964082aa9';
const MERCHANT_ID = 'M224FPWUGXCXH';
const MERCHANT_BASE_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
const MERCHANT_STATUS_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/status';
const redirectUrl =
  'https://603-coworking-backend.vercel.app/api/v1/order/status';
const refundUrl = `https://api.phonepe.com/apis/hermes/pg/v1/refund`;
const successUrl = 'https://www.603thecoworkingspace.com/dashboard';
const failureUrl = 'https://www.603thecoworkingspace.com/payment';

// app.post('/create-order', async (req, res) => {
export const create = async (req: Request, res: Response) => {
  const { accHolder, amount, bookings, dayPasses, discountPercentage } =
    req.body;
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
    redirectUrl: `${redirectUrl}/?id=${orderId}&bookings=${encodeURIComponent(
      JSON.stringify(bookings)
    )}&daypasses=${encodeURIComponent(JSON.stringify(dayPasses))}&userID=${
      accHolder._id
    }&amount=${amount}&discountPercentage=${discountPercentage}`,
    redirectMode: 'REDIRECT',
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    'base64'
  );
  // SHA256(base64 encoded payload + “/pg/v1/pay” +
  //   salt key) + ### + salt index
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
    const response = await axios.request(option);
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({
      msg: 'OK',
      url: response.data.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    console.log('error in payment', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

// app.post('/status', async (req, res) => {
export const validate = async (req: Request, res: Response) => {
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
  const string =
    `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
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

  //response.data
  // {
  //   success: true,
  //   code: 'PAYMENT_SUCCESS',
  //   message: 'Your payment is successful.',
  //   data: {
  //     merchantId: 'PGTESTPAYUAT86',
  //     merchantTransactionId: 'z1ha38nlsq2ur0u',
  //     transactionId: 'T2412131529091020295178',
  //     amount: 10000,
  //     state: 'COMPLETED',
  //     responseCode: 'SUCCESS',
  //     paymentInstrument: {
  //       type: 'CARD',
  //       cardType: 'CREDIT_CARD',
  //       pgTransactionId: 'PG2207221432267522530776',
  //       bankTransactionId: null,
  //       pgAuthorizationCode: null,
  //       arn: '12121214455',
  //       bankId: null,
  //       brn: 'B12345'
  //     }
  //   }
  // }

  axios.request(option).then(response => {
    console.log(response.data);
    if (response.data.code === 'PAYMENT_SUCCESS') {
      // return res.redirect(successUrl);
      const paymentMethod = response.data.data.paymentInstrument.type;
      const payment = response.data.data;
      if (bookingsRaw !== 'undefined') {
        const bookings = JSON.parse(decodeURIComponent(bookingsRaw as string));
        console.log(bookings);

        // // return res.redirect(successUrl);
        // const paymentMethod = response.data.data.paymentInstrument.type;
        // const payment = response.data.data;
        if (bookings.length !== 0) {
          processBookings(
            bookings,
            userID,
            paymentMethod,
            payment,
            merchantTransactionId,
            discountPercentage
          );
        }
      }

      if (daypassesRaw !== 'undefined') {
        const daypasses = JSON.parse(
          decodeURIComponent(daypassesRaw as string)
        );
        console.log(daypasses);
        if (daypasses.length !== 0) {
          processDaypasses(
            daypasses,
            userID,
            paymentMethod,
            payment,
            merchantTransactionId,
            discountPercentage
          );
        }
      }

      return res.redirect(`${successUrl}`);
    } else {
      return res.redirect(`${failureUrl}`);
    }
  });
};

export const phonepeCallback = async (req: Request, res: Response) => {
  console.log('welcome to the callback url');
};

// {
//   success: true,
//   code: 'PAYMENT_SUCCESS',
//   message: 'Your payment is successful.',
//   data: {
//     merchantId: 'PGTESTPAYUAT86',
//     merchantTransactionId: 'z1ha38nlsq2ur0u',
//     transactionId: 'T2412141010019210295412',
//     amount: 10000,
//     state: 'COMPLETED',
//     responseCode: 'SUCCESS',
//     paymentInstrument: {
//       type: 'CARD',
//       cardType: 'CREDIT_CARD',
//       pgTransactionId: 'PG2207221432267522530776',
//       bankTransactionId: null,
//       pgAuthorizationCode: null,
//       arn: '12121214455',
//       bankId: null,
//       brn: 'B12345'
//     }
//   }
// }

// accept: 'text/plain',
export const refund = async (req: Request, res: Response) => {
  console.log('refund initialization');
  const { accHolder, bookingid, selectedTransaction } = req.body;
  console.log(req.body);
  //  || 'z1ha38nlsq2ur0u'
  const orderId = selectedTransaction.transactionId;

  //refund amount in paisa
  const refundAmount = selectedTransaction.transactionAmount * 100;
  console.log(refundAmount);

  const refundTransactionID = uniqid();
  // const {} = req.body;
  // callbackUrl: 'https://webhook.site/callback-url',
  // callbackUrl: 'http://127.0.0.1:3000/refundcallback',
  // merchantTransactionId: 'ROD620471739210623',
  // merchantUserId: accHolder.name,
  // callbackUrl: 'http://127.0.0.1:3000/api/v1/order/refundcallback',

  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: accHolder._id,
    originalTransactionId: orderId,
    merchantTransactionId: refundTransactionID,
    amount: refundAmount,
    callbackUrl:
      'https://603-coworking-backend.vercel.app/api/v1/order/refundcallback',
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    'base64'
  );

  // SHA256(base64 encoded payload + “/pg/v1/refund” + salt key) + ### + salt index
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

  // axios
  //   .request(options)
  //   .then(function (response: any) {
  //     console.log(response.data);
  //   })
  //   .catch(function (error: any) {
  //     console.error(error.message);
  //   });

  try {
    const response = await axios.request(options);
    // console.log('refund init', response.data);
    // res.status(200).json({
    //   msg: 'OK',
    //   data: response.data,
    // });
    const merchantTransactionId = response.data.data.merchantTransactionId;
    if ((response.data.code = 'PAYMENT_PENDING')) {
      const keyIndex = 1;
      const string =
        `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
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
      const meetOrConfBooking = await BookingModel.findById(bookingid);

      //get daypass booking from the daypass db
      const daypassBooking = await DayPass.findById(bookingid);

      //if meetorconfBooking is true
      if (meetOrConfBooking) {
        //get and update the booking to the status to refund
        const getbooking = await BookingModel.findByIdAndUpdate(
          bookingid,
          { status: 'REFUND' },
          { new: true, runValidators: true }
        );

        console.log('bookingthatShouldbecancelled', getbooking);

        const getspace = await SpaceModel.findOne({
          name: getbooking?.spaceName,
        });

        const storeBookingInCancelledDb = new CancelledBookingModel({
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
        await BookingModel.findByIdAndDelete(getbooking?._id);
      }

      //if daypassbooking is true
      if (daypassBooking) {
        //get and update the booking to the status to refund
        const getbooking = await DayPass.findByIdAndUpdate(
          bookingid,
          { status: 'REFUND' },
          { new: true, runValidators: true }
        );

        console.log('bookingthatShouldbecancelled', getbooking);

        const getspace = await SpaceModel.findOne({
          name: getbooking?.spaceName,
        });

        const storeBookingInCancelledDb = new CancelledBookingModel({
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
        const updatedSpace = await SpaceModel.findOneAndUpdate(
          { name: getbooking?.spaceName }, // Filter
          { $inc: { availableCapacity: getbooking?.quantity } }, // increment
          { new: true, runValidators: true } // Return the updated document
        );

        await storeBookingInCancelledDb.save();

        await DayPass.findByIdAndDelete(getbooking?._id);
      }

      res.status(200).json(response.data);
    }
  } catch (error: any) {
    console.log('error in payment', error.message);
    res
      .status(500)
      .json({ error: 'Failed to refund payment', errorMsg: error });
  }
};

// {
//   success: true,
//   code: 'PAYMENT_SUCCESS',
//   message: 'Your payment is successful.',
//   data: {
//     merchantId: 'PGTESTPAYUAT86',
//     merchantTransactionId: 'ROD620471739210623',
//     transactionId: 'TR2412141115357080295779',
//     amount: 10000,
//     state: 'COMPLETED',
//     responseCode: 'SUCCESS',
//     paymentInstrument: {
//       type: 'CARD',
//       cardType: 'CREDIT_CARD',
//       pgTransactionId: 'PG2207221432267522530123',
//       bankTransactionId: null,
//       pgAuthorizationCode: null,
//       arn: '74332743330332971112226767',
//       bankId: 'HDFC',
//       brn: 'B12345'
//     }
//   }
// }

export const refundcallback = async (req: Request, res: Response) => {
  console.log('refund callback request');
};

// //razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEYID,
//   key_secret: process.env.RAZORPAY_SECRETKEY,
// });

// // Route to handle order creation
// export const createOrder = async (req: Request, res: Response) => {
//   try {
//     const { options } = req.body;
//     console.log(req.body);

//     const order = await razorpay.orders.create(options);
//     console.log(order);

//     if (!order) {
//       return res.status(500).json({ message: "error" });
//     }
//     res.status(200).json(order);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "error",
//       error,
//     });
//   }
// };

// // Route to handle payment validation and fetch payment method
// export const validateOrder = async (req: Request, res: Response) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
//     req.body;

//   // Verify the payment signature
//   const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRETKEY);
//   sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//   const digest = sha.digest("hex");

//   if (digest !== razorpay_signature) {
//     return res.status(400).json({ msg: "Transaction is not legit" });
//   }

//   try {
//     // Fetch payment details from Razorpay
//     const payment = await razorpay.payments.fetch(razorpay_payment_id);
//     if (!payment) {
//       return res
//         .status(500)
//         .json({ msg: "Error fetching payment details", payment });
//     }

//     // Extract the payment method used
//     const paymentMethod = payment.method; // e.g., "card", "upi", "netbanking", etc.

//     //payment status
//     const paymentStatus = payment.status; //eg,'authorized','captured','failed'
//     if (paymentStatus === "failed") {
//       // Payment failed
//       return res.status(400).json({
//         msg: "Payment failed",
//         status: paymentStatus, // Failed status
//         error: payment.error_code ? payment.error_code : "Unknown error",
//         description: payment.error_description
//           ? payment.error_description
//           : "No description available",
//       });
//     }
//     // Send response back with payment details
//     res.status(200).json({
//       msg: "Success",
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       paymentMethod, // Send the payment method in the response
//       paymentDetails: payment, // Optional: Send complete payment details if needed
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ msg: "error ", error });
//   }
// };

//function to store multiple  booking and payment and send email to the user
export const createBookingPaymentDatabase = async (
  req: Request,
  res: Response
) => {
  const { bookings, userDetails, paymentMethod, paymentDetails, paymentId } =
    req.body;

  console.log(req.body);

  //kayb hqev clbb euvv   for application

  //get the lenght of the array
  const TotalBookings = bookings.length + 1;

  // Assuming you want to map through the bookings and process each one
  const processBookings = async (bookings: any) => {
    try {
      // Use Promise.all to wait for all async operations to complete

      const bookingResults = await Promise.all(
        bookings.map(async (booking: any) => {
          // Find the location
          const loc = await SpaceModel.findOne({ name: booking.spaceName });
          if (!loc) {
            throw new Error('Location not found');
          }

          const newBooking = new BookingModel({
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
          const newPayment = new PaymentModel({
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
          const templatePath = path.join(__dirname, '../utils/email.html');
          let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

          // Replace placeholders with actual values
          const htmlContent = htmlTemplate
            .replace('{{name}}', userDetails.companyName)
            .replace('{{startTime}}', booking.startTime)
            .replace('{{endTime}}', booking.endTime)
            .replace('{{place}}', loc.name)
            .replace('{{date}}', booking.date);

          // Send confirmation email
          await sendEmailAdmin(
            userEmail,
            'Booking Confirmation',
            'Your room booking at 603 Coworking Space has been successfully confirmed.',
            htmlContent
          );

          return storeBooking;
        })
      );
      // After all bookings are processed, send a response
      res.status(201).json(bookingResults);
    } catch (error) {
      console.log(error);
      res.status(404).json({
        message: 'something went wrong creating booking &storing ',
        error,
      });
    }
  };

  processBookings(bookings);
};

//mutiple booking for daypasses
export const createdaypassesPaymentDatabase = async (
  req: Request,
  res: Response
) => {
  const { daypasses, paymentDetails, paymentMethod, userDetails, paymentId } =
    req.body;
  //get space id
  console.log(req.body);
  // Assuming you want to map through the bookings and process each one
  const processDaypasses = async (daypasses: any) => {
    try {
      // Use Promise.all to wait for all async operations to complete

      const dayPassResults = await Promise.all(
        daypasses.map(async (daypass: any) => {
          // Find the location
          const loc = await SpaceModel.findOne({ name: daypass.spaceName });
          if (!loc) {
            throw new Error('Location not found');
          }

          const newDaypass = new DayPass({
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
          const newPayment = new PaymentModel({
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
          const templatePath = path.join(
            __dirname,
            '../utils/daypassEmail.html'
          );
          console.log(templatePath);

          let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

          // Replace placeholders with actual values
          const a = userDetails.companyName;
          const htmlContent = htmlTemplate
            .replace('{{name}}', a)
            .replace('{{place}}', daypass.spaceName)
            .replace('{{date}}', daypass.bookeddate);

          await sendEmailAdmin(
            userEmail,
            'Booking Confirmation',
            'Your dayPass booking at 603 Coworking Space has been successfully confirmed.',
            htmlContent
          );

          return storeDaypass;
        })
      );

      // After all daypass are processed, send a response
      res.status(201).json(dayPassResults);
    } catch (error) {
      console.log(error);
      res.status(404).json({
        message: 'something went wrong creating daypasses &storing ',
        error,
      });
    }
  };

  processDaypasses(daypasses);
};
