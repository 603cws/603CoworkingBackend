import nodemailer from "nodemailer";

// General Email Function
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};



export const sendCareerEmailCompany = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};



export const sendCareerEmailCandidate = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Sales Email Function
export const sendEmailSales = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending sales email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending sales email:", error);
    throw error;
  }
};

// Admin Email Function
export const sendEmailAdmin = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending admin email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending admin email:", error);
    throw error;
  }
};



export const sendEmailPartner = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending Partnership email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending Partnership email:", error);
    throw error;
  }
};



export const sendEventEmail = async (to: string, subject: string, text: string, html: string) => {
  console.log("Sending email to:", to);
  console.log("Email subject:", subject);
  console.log("Email text:", text);

  let transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};