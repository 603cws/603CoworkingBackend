import axios from 'axios';
import { Request, Response } from 'express';
import { string } from 'zod';

import { UserModel } from '../models/user.model';

// const access_token = require("./../../index");

//field in zoho crm that diffrenciates that it is a website lead or manually created lead
// websiteLead

const ZOHO_TOKEN_URL = 'https://accounts.zoho.com/oauth/v2/token';

let {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REDIRECT_URL,
  ZOHO_AUTHORIZATION_CODE,
  ZOHO_REFRESH_TOKEN,
} = process.env;

const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();
const date = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();

// Async function to get current date and time
const getCurrentDateTime = async () => {
  // Simulate async operation if needed (e.g., fetching from an API)
  return new Promise(resolve => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    resolve({ year, month, date, hours, minutes, seconds });
  });
};

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

// Function to generate a new access token using the refresh token
const getAccessToken = async () => {
  try {
    const response = await axios.post(ZOHO_TOKEN_URL, null, {
      params: {
        grant_type: 'refresh_token',
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        refresh_token: ZOHO_REFRESH_TOKEN,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = response.data;
    return access_token;
  } catch (error) {
    console.error('Error generating access token:');
    throw error;
  }
};

// setInterval(async () => {
//   access_token = await getAccessToken();
// }, 55 * 60 * 1000); // Refresh every 55 minutes

// LAYOUT ID  3269090000016654005

// Function to use the access token in an API request to Zoho CRM for contact form
export const createLead = async (data: any) => {
  try {
    const accessToken = await getAccessToken();
    console.log(accessToken);

    const {
      name,
      phone,
      email,
      location,
      company,
      requirements,
      specifications,
    } = data;

    console.log(data);

    // let Location = location;
    let Company = company || ' ';
    let Lead_Requirement = requirements;

    let Email = email;
    let Phone = phone;

    const currentdateTime: any = await getCurrentDateTime();

    //split username

    const [First_Name, Last_Name] = name.split(' ');

    //date

    const zohoCRMUrl = 'https://www.zohoapis.com/crm/v2/Leads';
    const leadData = {
      data: [
        {
          First_Name,
          Last_Name,
          Email,
          Phone,
          webLeadLocation: location,
          // Date_Time_4: '2024-11-27T11:40:30+06:00',
          // Date_Time_4: `${year}-${month}-${date}T${hours}:${minutes}:30+06:00`,
          Date_Time_4: `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}T${currentdateTime.hours}:${currentdateTime.minutes}:30+05:30`,
          // Date_Time_4: `${year}-${month}-${date}T${hours}:${minutes}:${seconds}+05:30`,
          Lead_Requirement,
          websiteLead: `website`,
          Company,
          specifications: specifications || '',
          layout: {
            id: '3269090000016654005',
          },
        },
      ],
    };

    const response = await axios.post(zohoCRMUrl, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Lead created successfully:', response.data);
    console.log(response.data.data[0].details);
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};

// Function to use the access token in an API request to Zoho CRM for contact form
export const createLeadPopupForm = async (data: any) => {
  try {
    const accessToken = await getAccessToken();
    console.log(accessToken);

    const { name, phone, email, company, requirements } = data;

    console.log(data);
    const currentdateTime: any = await getCurrentDateTime();

    // let Location = location;
    let Company = company;
    let Lead_Requirement = requirements;
    let Email = email;
    let Phone = phone;

    //split username
    const [firstname, lastname] = name.split(' ');
    //date

    // let Date_Time_4 = `'${year}-${month}-${date}T${hours}:${minutes}:${seconds}+06:00'`;
    // console.log(Date_Time_4);

    const zohoCRMUrl = 'https://www.zohoapis.com/crm/v2/Leads';
    const leadData = {
      data: [
        {
          First_Name: firstname || ' ',
          Last_Name: lastname || ' ',
          Email,
          Phone,
          // Date_Time_4: '2024-11-27T11:40:30+06:00',
          Date_Time_4: `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}T${currentdateTime.hours}:${currentdateTime.minutes}:30+05:30`,
          Lead_Requirement,
          websiteLead: 'website',
          Company,
          layout: {
            id: '3269090000016654005',
          },
        },
      ],
    };

    const response = await axios.post(zohoCRMUrl, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Lead created successfully:', response.data);
    console.log(response.data.data[0].details);
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};

export const requestTourLead = async (data: any) => {
  try {
    const accessToken = await getAccessToken();
    console.log(accessToken);

    const { name, phone, email, location, intrestedIn } = data;

    console.log(data);
    const currentdateTime: any = await getCurrentDateTime();
    let Email = email;
    let Phone = phone;

    //split username

    const [First_Name, Last_Name] = name.split(' ');
    //date

    const zohoCRMUrl = 'https://www.zohoapis.com/crm/v2/Leads';
    const leadData = {
      data: [
        {
          First_Name,
          Last_Name: Last_Name || ' ',
          Email,
          Phone,
          // Date_Time_4: '2024-11-27T11:40:30+06:00',
          Date_Time_4: `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}T${currentdateTime.hours}:${currentdateTime.minutes}:30+05:30`,
          Lead_Requirement: intrestedIn,
          webLeadLocation: location,
          websiteLead: `website`,
          layout: {
            id: '3269090000016654005',
          },
        },
      ],
    };

    const response = await axios.post(zohoCRMUrl, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Lead created successfully:', response.data);
    console.log(response.data.data[0].details);
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};

//zoho booking
export const createBookingOnZoho = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    // console.log(accessToken);

    const { user, booking, daypass } = req.body;

    console.log(req.body);

    const currentdateTime: any = await getCurrentDateTime();

    console.log(currentdateTime);

    const zohoCRMUrl = 'https://www.zohoapis.com/crm/v2/Bookings';
    const leadData = {
      data: [
        {
          Name: user.name,
          Email: user.email,
          Phone: user.phone,
          Booking_type: booking.spaceName,
          start_Time: booking.startTime,
          End_time: booking.endTime,
          booking_date: booking.date,
          bookdate: `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}`,
          location: booking.location,
          Db_booking_id: booking._id,
          user_Id: user._id,
          // Date_Time_4: '2024-11-27T11:40:30+06:00',
          // Date_Time_4: `${year}-${month}-${date}T${hours}:${minutes}:30+05:30`,
        },
      ],
    };

    const response = await axios.post(zohoCRMUrl, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Booking  created successfully:', response.data);
    console.log(response.data.data[0].details);

    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};
//store the booking in the zoho
export const createBookingOnZohoOnlinePay = async (
  userId: any,
  booking: any
) => {
  try {
    const accessToken = await getAccessToken();
    // console.log(accessToken);
    //get user from db
    const user = await UserModel.findById(userId);
    // const { user, booking, daypass }

    const currentdateTime: any = await getCurrentDateTime();

    const zohoCRMUrl = 'https://www.zohoapis.com/crm/v2/Bookings';
    const leadData = {
      data: [
        {
          Name: user?.username,
          Email: user?.email,
          Phone: user?.phone,
          Booking_type: booking.spaceName,
          start_Time: booking.startTime,
          End_time: booking.endTime,
          booking_date: booking.date,
          bookdate: `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}`,
          location: booking.location,
          Db_booking_id: booking?._id,
          user_Id: user?._id,
        },
      ],
    };

    const response = await axios.post(zohoCRMUrl, leadData, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Booking  created successfully:', response.data);
    console.log(response.data.data[0].details);
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};

//get all the bookings
export const getBookings = async (req: Request, res: Response) => {
  const url = 'https://www.zohoapis.com/crm/v2/Bookings'; // Replace 'Bookings' with your module's API name

  const accessToken = await getAccessToken();
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    // const data = await response.json();

    res.status(200).json(response.data);
    // console.log(response.data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
};

// getBookings();

export const getlayouts = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    console.log(accessToken);

    const zohoCRMUrl =
      'https://www.zohoapis.com/crm/v2/settings/layouts?module=Leads';

    const response = await axios.get(zohoCRMUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};
// Example usage
// createLead();

export const zohoFormWebHook = async (req: Request, res: Response) => {
  try {
    const formData = req.body; // The data sent from Zoho Forms

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: formData.Email },
      { kyc: true },
      { new: true }
    );

    if (!updatedUser) return res.status(400).json('user not found ');

    // console.log('Received webhook data:', formData);

    res.status(200).json({
      formData,
      updatedUser,
    });
  } catch (error) {
    // console.error('Error handling webhook:', error);
    res.status(500).json(error);
  }
};
