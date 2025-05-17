import { sendCareerEmailCandidate, sendCareerEmailCompany } from "../utils/emailUtils";
import { Request, Response } from "express";
import path from "path";
import fs from 'fs';


export const sendJobCallBack = async (req: Request, res: Response) => {
    try {
        const sales = process.env.EMAIL_ADMIN || "";
        const { name, email, phone, position, experience } = req.body;

        const templatePath = path.join(__dirname, '../utils/candidatecareeremail.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

        const a = name;
        const htmlContent = htmlTemplate
            .replace('{{name}}', a)
            .replace('{{position}}', position)
            

        await sendCareerEmailCandidate(
            email,
            "Thank You for Applying!",
            "Your application has been successfully recieved.",
            htmlContent
        );

        const templatePath2 = path.join(__dirname, '../utils/companycareeremail.html');
        let htmlTemplate2 = fs.readFileSync(templatePath2, 'utf8');


        const htmlContent2 = htmlTemplate2
            .replace('{{name}}', a)
            .replace('{{phone}}', phone)
            .replace('{{email}}', email)
            .replace('{{position}}', position)
            .replace('{{experience}}', experience)

        await sendCareerEmailCompany(
            sales,
            "New Job Application Received!",
            "A Job Application has been recieved.",
            htmlContent2
        );

        res.status(200).json({ msg: "Request sent to both user and admin successfully!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal server error3" });
    }
};