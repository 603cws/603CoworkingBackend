"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEventEmail = exports.sendEmailPartner = exports.sendEmailAdmin = exports.sendEmailSales = exports.sendCareerEmailCandidate = exports.sendCareerEmailCompany = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// General Email Function
const sendEmail = async (to, subject, text, html) => {
    console.log("Sending email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendCareerEmailCompany = async (to, subject, text, html) => {
    console.log("Sending email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.ADMIN_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendCareerEmailCompany = sendCareerEmailCompany;
const sendCareerEmailCandidate = async (to, subject, text, html) => {
    console.log("Sending email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.ADMIN_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendCareerEmailCandidate = sendCareerEmailCandidate;
// Sales Email Function
const sendEmailSales = async (to, subject, text, html) => {
    console.log("Sending sales email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_SALES,
            pass: process.env.PASS_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_SALES,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Sales email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending sales email:", error);
        throw error;
    }
};
exports.sendEmailSales = sendEmailSales;
// Admin Email Function
const sendEmailAdmin = async (to, subject, text, html) => {
    console.log("Sending admin email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.ADMIN_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Admin email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending admin email:", error);
        throw error;
    }
};
exports.sendEmailAdmin = sendEmailAdmin;
const sendEmailPartner = async (to, subject, text, html) => {
    console.log("Sending Partnership email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_SALES,
            pass: process.env.PASS_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_SALES,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Partnership email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending Partnership email:", error);
        throw error;
    }
};
exports.sendEmailPartner = sendEmailPartner;
const sendEventEmail = async (to, subject, text, html) => {
    console.log("Sending email to:", to);
    console.log("Email subject:", subject);
    console.log("Email text:", text);
    let transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.ADMIN_SALES,
        },
    });
    let mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to,
        subject,
        text,
        html,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendEventEmail = sendEventEmail;
