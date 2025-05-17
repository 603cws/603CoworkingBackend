import { Request, Response } from 'express';
import { BookingModel } from '../models/booking.model';
import { DayPass } from '../models/Daypassbookingmodel';
import { sendEmailAdmin } from '../utils/emailUtils';
import { UserModel } from '../models/user.model';
import fs from 'fs';
import path from 'path';
import { SpaceModel } from '../models/space.model';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { CancelledBookingModel } from '../models/cancelledBooking.model';

//convert time to 24hr basis
function timeTo24Hours(timeStr: string): string {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (modifier === 'pm' && hours !== '12') {
    hours = (parseInt(hours, 10) + 12).toString();
  } else if (modifier === 'am' && hours === '12') {
    hours = '00';
  }

  return `${hours}:${minutes}`;
}

//check time overlap function
export const checkTimeOverlap = function (
  documents: any,
  inputStartTime: string,
  inputEndTime: string
) {
  // Convert input times to 24-hour format for comparison
  const inputStart = timeTo24Hours(inputStartTime);
  const inputEnd = timeTo24Hours(inputEndTime);

  for (let doc of documents) {
    // Convert document start and end times to 24-hour format
    const docStart = timeTo24Hours(doc.startTime);
    const docEnd = timeTo24Hours(doc.endTime);

    // Check for overlap
    if (
      inputStart < docEnd &&
      inputEnd > docStart // General time overlap condition
    ) {
      return true; // Overlap found
    }
  }

  return false; // No overlap found
};

//check booking available
export const checkBookingAvailable = async (req: Request, res: Response) => {
  const { startTime, endTime, location, date } = req.body.appointmentDetails;
  //get all the booking for same date
  const bookingDetails = await BookingModel.find({
    date: date,
    spaceName: location,
  });

  //check is it overlaping with somebooking
  const isoverlap = checkTimeOverlap(bookingDetails, startTime, endTime);

  //check if already booking exist
  if (isoverlap) {
    return res
      .status(404)
      .json({ message: 'booking aleady exist on this time range' });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  const { startTime, endTime, email, location, date, companyName } =
    req.body.appointmentDetails;
  const { credits } = req.body;

  //get all the booking for same date
  const bookingDetails = await BookingModel.find({
    date: date,
    spaceName: location,
  });

  // console.log(bookingDetails);
  const isoverlap = checkTimeOverlap(bookingDetails, startTime, endTime);

  // console.log(isoverlap);

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email ID is required' });
    }
    const userdet = await UserModel.findOne({ email: email });
    if (!userdet) {
      return res.status(404).json({ message: 'User not found' });
    }

    //check if already booking exist
    if (isoverlap) {
      return res
        .status(404)
        .json({ message: 'booking aleady exist on this time range' });
    }

    // Find the location
    const loc = await SpaceModel.findOne({ name: location });
    if (!loc) {
      return res.status(404).json({ message: 'Location not found' });
    }
    if (userdet.creditsleft >= credits) {
      userdet.creditsleft -= credits;
    } else {
      const a = userdet.creditsleft;
      userdet.creditsleft = 0;
      userdet.extracredits += credits - a;
    }
    const newBooking = new BookingModel({
      user: userdet._id,
      space: loc._id,
      companyName,
      spaceName: location,
      location,
      startTime,
      endTime,
      date,
      creditsspent: credits,
      paymentMethod: 'credits',
      status: 'confirmed',
    });

    await userdet.save();
    await newBooking.save();

    if (!userdet || !userdet.email) {
      throw new Error('User email is not defined');
    }

    const userEmail = userdet.email;

    // Read HTML template from file
    const templatePath = path.join(__dirname, '../utils/email.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual values
    const a = userdet.companyName;
    const htmlContent = htmlTemplate
      .replace('{{name}}', a)
      .replace('{{startTime}}', startTime)
      .replace('{{endTime}}', endTime)
      .replace('{{place}}', location)
      .replace('{{date}}', date);

    // Send confirmation email

    await sendEmailAdmin(
      userEmail,
      'Booking Confirmation',
      'Your room booking at 603 Coworking Space has been successfully confirmed.',
      htmlContent
    );

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

//get only specified location bookings
export const getlocationbookings = async (req: Request, res: Response) => {
  try {
    const { selectedDate, selectedLocation } = req.body;

    if (!selectedLocation) {
      return res.status(400).json({ message: 'selectedLocation is required' });
    }

    if (!selectedDate) {
      return res.status(400).json({ message: 'selectedDate is required' });
    }

    const location = await SpaceModel.findOne({ name: selectedLocation });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const bookings = await BookingModel.find({
      date: selectedDate,
      space: location._id,
    });
    if (bookings.length != 0) {
      let arr: [string, string][] = bookings.map(a => [a.startTime, a.endTime]);

      const convertToTime = (time: string): Date => {
        const [hourMinute, period] = time.split(' ');
        let [hour, minute] = hourMinute.split(':').map(Number);
        if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
        return new Date(0, 0, 0, hour, minute);
      };

      arr.sort(
        (a, b) => convertToTime(a[0]).getTime() - convertToTime(b[0]).getTime()
      );
      const merged: [string, string][] = [];
      let [currentStart, currentEnd] = arr[0];

      for (let i = 1; i < arr.length; i++) {
        let [nextStart, nextEnd] = arr[i];

        if (convertToTime(nextStart) <= convertToTime(currentEnd)) {
          currentEnd =
            convertToTime(nextEnd) > convertToTime(currentEnd)
              ? nextEnd
              : currentEnd;
        } else {
          merged.push([currentStart, currentEnd]);
          [currentStart, currentEnd] = [nextStart, nextEnd];
        }
      }

      merged.push([currentStart, currentEnd]);
      res.status(200).json(merged);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Get all bookings
export const getAllBookingsbyuser = async (req: Request, res: Response) => {
  try {
    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      console.error('JWT secret key is not defined');
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('jsdodckj   ', req.headers);
    const token = cookies.token;
    console.log(token);
    const decoded: any = jwt.verify(token, secretKey);

    const bookings = await BookingModel.find({ user: decoded.id });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};
//get all cancelled bookings by user
export const getAllCancelledBookingsbyuser = async (
  req: Request,
  res: Response
) => {
  try {
    const secretKey = process.env.SECRETKEY;
    if (!secretKey) {
      console.error('JWT secret key is not defined');
      return res.status(500).json({ msg: 'JWT secret key is not defined' });
    }
    const cookies = cookie.parse(req.headers.cookie || '');
    console.log('jsdodckj   ', req.headers);
    const token = cookies.token;
    console.log(token);
    const decoded: any = jwt.verify(token, secretKey);

    const bookings = await CancelledBookingModel.find({ user: decoded.id });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const bookingId = req.params.id;
  try {
    const booking = await BookingModel.findById(bookingId).populate(
      'user space'
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
};

// Get bookings by user ID
export const getBookingsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const bookings = await BookingModel.find({ user: userId }).populate(
      'space'
    );
    if (!bookings) {
      return res.status(404).json({ message: 'Bookings not found' });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching bookings by user ID', error });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error });
  }
};

// Delete a booking
export const deleteBookingbyadmin = async (req: Request, res: Response) => {
  const { id } = req.body; // Extract ID from req.body
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error });
  }
};

export const deleteBookingbyuser = async (req: Request, res: Response) => {
  const { bookingid, isCancellable, isRefundable } = req.body;
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(bookingid);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (isCancellable) {
      const user = await UserModel.findById(deletedBooking.user);
      if (!user) {
        return res.status(404).json({ message: 'user not found' });
      }
      if (isRefundable) {
        let a = user?.creditsleft;
        a += deletedBooking.creditsspent;
        if (user.monthlycredits <= a) {
          user.creditsleft = user.monthlycredits;
        } else {
          user.creditsleft = a;
        }
      }
      await user.save();
    }
    res.status(200).json({ message: 'Booking cancelled successfully!' });

    //send a cancel booking email
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error });
  }
};

export const allbookingbyadmin = async (req: Request, res: Response) => {
  try {
    // Fetch bookings sorted by createdAt in descending order
    const allbookings = await BookingModel.find().sort({ createdAt: -1 });

    // Fetch users with only the _id and extracredits fields
    const allusers = await UserModel.find({}, { _id: 1, extracredits: 1 });

    return res.status(200).json({
      msg: 'bookingdetails',
      allbookings,
      allusers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
export const onlinebookingbyadmin = async (req: Request, res: Response) => {
  try {
    // Fetch bookings sorted by createdAt in descending order
    // const allbookings = await BookingModel.find().sort({ createdAt: -1 });

    const allbookings = await BookingModel.find({
      paymentMethod: { $ne: 'credits' },
    })
      .populate('user', '_id kyc email company username')
      .sort({ createdAt: -1 });
    // const allbookings = await BookingModel.find({
    //   paymentMethod: { $ne: 'credits' },
    // }).sort({ createdAt: -1 });

    //   {
    //     "_id": "67cfe2303071f1b46eec6227",
    //     "user": "67cfe0463071f1b46eec6209",
    //     "space": "672485905c694d98e3e004d2",
    //     "companyName": "SATT SHIPPING & LOGISTIC",
    //     "spaceName": "Millennium Meeting Room",
    //     "startTime": "3:00 pm",
    //     "endTime": "4:30 pm",
    //     "creditsspent": 0,
    //     "date": "11/3/2025",
    //     "transactionId": "o8j033m845ajc0",
    //     "transactionTIme": "12:41",
    //     "transactionAmount": 706.23,
    //     "status": "COMPLETED",
    //     "paymentMethod": "CARD",
    //     "createdAt": "2025-03-11T07:11:44.709Z",
    //     "__v": 0
    // },

    // const alldaypassbookings = await DayPass.find({
    //   paymentMethod: { $ne: 'credits' },
    // }).sort({ createdAt: -1 });

    const alldaypassbookings = await DayPass.find({
      paymentMethod: { $ne: 'credits' },
    })
      .populate('user', '_id kyc email company username')
      .sort({ createdAt: -1 });

    //   {
    //     "quantity": 1,
    //     "_id": "677b5c5fbe860e2be580d5cb",
    //     "space": "672483a35c694d98e3e004bb",
    //     "user": "677b5bc1be860e2be580d5c1",
    //     "companyName": "Meinigar Technologies Pvt Ltd",
    //     "email": "rohit@stockarea.io",
    //     "spaceName": "Sunmill Day Pass",
    //     "phone": "8850313924",
    //     "bookeddate": "6/1/2025",
    //     "startTime": "09:00 am",
    //     "endTime": "09:00 pm",
    //     "creditsspent": 0,
    //     "date": "6/1/2025",
    //     "day": 6,
    //     "month": 1,
    //     "year": 2025,
    //     "transactionId": "4wj1c3m5kjmao7",
    //     "transactionTIme": "04:30",
    //     "transactionAmount": 706.8199999999999,
    //     "status": "COMPLETED",
    //     "paymentMethod": "UPI",
    //     "createdAt": "2025-01-06T04:30:23.707Z",
    //     "__v": 0
    // },

    console.log(allbookings.length);
    console.log(alldaypassbookings.length);

    // Fetch users with only the _id and extracredits fields
    const allusers = await UserModel.find(
      {},
      { _id: 1, extracredits: 1, kyc: 1 }
    );

    // Merge both arrays and sort by createdAt in descending order
    const combinedBookings = [...allbookings, ...alldaypassbookings];
    // const combinedBookings = [...allbookings, ...alldaypassbookings].sort(
    //   (a, b) =>
    //     new Date(b.createdAt || 0).getTime() -
    //     new Date(a.createdAt || 0).getTime()
    // );

    console.log(combinedBookings.length);

    return res.status(200).json({
      msg: 'onlinebookingdetails',
      combinedBookings,
      allusers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};
