import { Request, Response, NextFunction } from "express";
import { BookingModel } from "../models/booking.model";
import { log } from "console";

//convert time to 24hr basis
function timeTo24Hours(timeStr: string): string {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier === "pm" && hours !== "12") {
    hours = (parseInt(hours, 10) + 12).toString();
  } else if (modifier === "am" && hours === "12") {
    hours = "00";
  }

  return `${hours}:${minutes}`;
}

//check time overlap function
function checkTimeOverlap(
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
}

// export const isBookingOverlap = async (req: Request, res: Response) => {
//   const { bookings } = req.body;

//   console.log(bookings);
//   //get all the booking for that date and location

//   const processBookings = async (bookings: any) => {
//     const bookingResults = await Promise.all(
//       bookings.map(async (booking: any) => {
//         const bookingDetails = await BookingModel.find({
//           date: booking.date,
//           spaceName: booking.spaceName,
//         });

//         console.log(bookingDetails);

//         //check if there is any overlap
//         const isoverlap = checkTimeOverlap(
//           bookingDetails,
//           booking.startTime,
//           booking.endTime
//         );

//         console.log(isoverlap);

//         if (isoverlap) {
//           return res
//             .status(400)
//             .json({ msg: "booking already exisit in this time range" });
//         }

//         if (!isoverlap) {
//           return res
//             .status(200)
//             .json({ msg: "no booking for this time range" });
//         }
//       })
//     );
//   };

//   processBookings(bookings);
// };

export const isBookingOverlap = async (req: Request, res: Response) => {
  const { bookings } = req.body;

  // Validate `bookings` is an array
  // if (!Array.isArray(bookings) || bookings.length === 0) {
  //   return res.status(400).json({ msg: "Invalid or missing bookings data." });
  // }

  if (bookings.length === 0) {
    return res.status(200).json({ msg: "no bookings" });
  }

  try {
    // Process bookings
    for (const booking of bookings) {
      // Fetch bookings matching the same date and location
      const bookingDetails = await BookingModel.find({
        date: booking.date,
        spaceName: booking.spaceName,
      });

      // Log for debugging
      console.log("Existing bookings:", bookingDetails);

      // Check for time overlap
      const isOverlap = checkTimeOverlap(
        bookingDetails,
        booking.startTime,
        booking.endTime
      );

      console.log("Overlap check:", isOverlap);

      //true overlap found ,false overlap not found

      // Return if there's an overlap
      if (isOverlap) {
        return res
          .status(400)
          .json({ msg: "Booking already exists in this time range." });
      }
    }
    // If no overlaps found
    return res
      .status(200)
      .json({ msg: "No booking overlaps for this time range." });
  } catch (error: unknown) {
    console.error("Error in isBookingOverlap:", error);
    return res.status(500).json({ msg: "Internal server error.", error });
  }
};

// https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.GGTMUUV59T01XKMLH3R6UKJ1Z1CH8D&scope=ZohoCRM.modules.ALL&redirect_uri=https://www.603thecoworkingspace.com/oauth/callback&access_type=offline

//https://www.603thecoworkingspace.com/oauth/callback?code=1000.a5916b095d0d727a264a4ab96f4843b4.8a25e197f23914880edea6a765e1d31a&location=us&accounts-server=https%3A%2F%2Faccounts.zoho.com&
