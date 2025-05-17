"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendJobCallBack = void 0;
const emailUtils_1 = require("../utils/emailUtils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sendJobCallBack = async (req, res) => {
    try {
        const sales = process.env.EMAIL_ADMIN || "";
        const { name, email, phone, position, experience } = req.body;
        const templatePath = path_1.default.join(__dirname, '../utils/candidatecareeremail.html');
        let htmlTemplate = fs_1.default.readFileSync(templatePath, 'utf8');
        const a = name;
        const htmlContent = htmlTemplate
            .replace('{{name}}', a)
            .replace('{{position}}', position);
        await (0, emailUtils_1.sendCareerEmailCandidate)(email, "Thank You for Applying!", "Your application has been successfully recieved.", htmlContent);
        const templatePath2 = path_1.default.join(__dirname, '../utils/companycareeremail.html');
        let htmlTemplate2 = fs_1.default.readFileSync(templatePath2, 'utf8');
        const htmlContent2 = htmlTemplate2
            .replace('{{name}}', a)
            .replace('{{phone}}', phone)
            .replace('{{email}}', email)
            .replace('{{position}}', position)
            .replace('{{experience}}', experience);
        await (0, emailUtils_1.sendCareerEmailCompany)(sales, "New Job Application Received!", "A Job Application has been recieved.", htmlContent2);
        res.status(200).json({ msg: "Request sent to both user and admin successfully!" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal server error3" });
    }
};
exports.sendJobCallBack = sendJobCallBack;
