// src/cron/cronHandler.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../src/models/user.model';
import fs from 'fs';
import path from 'path';
// import { VercelRequest, VercelResponse } from '@vercel/node';
// import { sendEmailAdmin, sendEmailSales } from '../utils/emailUtils';
import { sendEmailAdmin, sendEmailSales } from '../src/utils/emailUtils';
import { log } from 'console';

const schedule = require('node-schedule');

const MONGODB_URI = process.env.DB_URL;

// Create a simple log schema
const CronLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  message: { type: String },
});

const CronLog = mongoose.model('CronLog', CronLogSchema);

async function logCronExecution(message: string) {
  await CronLog.create({ message });
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return; // Already connected
  await mongoose.connect(MONGODB_URI as string);
}

export async function cronHandler(req: Request, res: Response) {
  await connectToDatabase();
  console.log('cron connected');
  // await logCronExecution('Cron job executed at: ' + new Date().toISOString());
  try {
    console.log('Cron job executed at:', new Date().toISOString());

    const result = await UserModel.updateMany({}, [
      { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
    ]);

    console.log(
      `Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents`
    );

    // await logCronExecution(`Updated ${result.modifiedCount} users`);

    res.status(200).json({ message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Error executing cron job:', error);
    // await logCronExecution('Error: ' + error);

    res.status(500).json({ message: 'Internal Server Error' });
  }
}

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

// scheduler to automate job
// Job to update availableCapacity
export const scheduleCreditsJob = () => {
  schedule.scheduleJob('0 7 1 * *', async () => {
    // schedule.scheduleJob('*/2 * * * *', async () => {
    console.log('Running the credits upate  job at', new Date().toISOString());
    try {
      const admin = process.env.EMAIL_ADMIN || '';
      const result = await UserModel.updateMany({}, [
        { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
      ]);

      console.log(
        `Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents`
      );

      let users = `${result.matchedCount}`;

      // get the user
      // const getuser = await UserModel.findOne({
      //   email: 'manchadiyuvraj@gmail.com',
      // });

      // update the user credits
      // const result = await UserModel.findByIdAndUpdate(getuser?._id, [
      //   { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
      // ]);

      const templatePath = path.join(
        __dirname,
        '../src/utils/CreditsUpdatedAdmin.html'
      );
      console.log(templatePath);

      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      console.log(htmlTemplate);

      let currentdateTime: any = await getCurrentDateTime();

      let date = `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}T${currentdateTime.hours}:${currentdateTime.minutes}:30+05:30`;

      // const a = `'134'`;
      const htmlContent = htmlTemplate
        .replace('{{Totalusers}}', users)
        .replace(`{{time}}`, date);

      await sendEmailSales(
        admin,
        'Credits updated',
        'Credits renewed',
        htmlContent
      );
    } catch (error) {
      console.log('something went wrong');
    }
  });
};
