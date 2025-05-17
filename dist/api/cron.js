"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCreditsJob = void 0;
exports.cronHandler = cronHandler;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../src/models/user.model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import { VercelRequest, VercelResponse } from '@vercel/node';
// import { sendEmailAdmin, sendEmailSales } from '../utils/emailUtils';
const emailUtils_1 = require("../src/utils/emailUtils");
const schedule = require('node-schedule');
const MONGODB_URI = process.env.DB_URL;
// Create a simple log schema
const CronLogSchema = new mongoose_1.default.Schema({
    timestamp: { type: Date, default: Date.now },
    message: { type: String },
});
const CronLog = mongoose_1.default.model('CronLog', CronLogSchema);
async function logCronExecution(message) {
    await CronLog.create({ message });
}
async function connectToDatabase() {
    if (mongoose_1.default.connection.readyState === 1)
        return; // Already connected
    await mongoose_1.default.connect(MONGODB_URI);
}
async function cronHandler(req, res) {
    await connectToDatabase();
    console.log('cron connected');
    // await logCronExecution('Cron job executed at: ' + new Date().toISOString());
    try {
        console.log('Cron job executed at:', new Date().toISOString());
        const result = await user_model_1.UserModel.updateMany({}, [
            { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
        ]);
        console.log(`Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents`);
        // await logCronExecution(`Updated ${result.modifiedCount} users`);
        res.status(200).json({ message: 'Cron job executed successfully' });
    }
    catch (error) {
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
const scheduleCreditsJob = () => {
    schedule.scheduleJob('0 7 1 * *', async () => {
        // schedule.scheduleJob('*/2 * * * *', async () => {
        console.log('Running the credits upate  job at', new Date().toISOString());
        try {
            const admin = process.env.EMAIL_ADMIN || '';
            const result = await user_model_1.UserModel.updateMany({}, [
                { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
            ]);
            console.log(`Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents`);
            let users = `${result.matchedCount}`;
            // get the user
            // const getuser = await UserModel.findOne({
            //   email: 'manchadiyuvraj@gmail.com',
            // });
            // update the user credits
            // const result = await UserModel.findByIdAndUpdate(getuser?._id, [
            //   { $set: { creditsleft: { $toDouble: '$monthlycredits' } } },
            // ]);
            const templatePath = path_1.default.join(__dirname, '../src/utils/CreditsUpdatedAdmin.html');
            console.log(templatePath);
            let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
            console.log(htmlTemplate);
            let currentdateTime = await getCurrentDateTime();
            let date = `${currentdateTime.year}-${currentdateTime.month}-${currentdateTime.date}T${currentdateTime.hours}:${currentdateTime.minutes}:30+05:30`;
            // const a = `'134'`;
            const htmlContent = htmlTemplate
                .replace('{{Totalusers}}', users)
                .replace(`{{time}}`, date);
            await (0, emailUtils_1.sendEmailSales)(admin, 'Credits updated', 'Credits renewed', htmlContent);
        }
        catch (error) {
            console.log('something went wrong');
        }
    });
};
exports.scheduleCreditsJob = scheduleCreditsJob;
