const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, message, email }) => {
  const transporter = nodemailer.createTransport({
    service: "SendGrid", // or Mailgun, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"eCommerce App" <${process.env.EMAIL_USER}>`,
    to: to || email,
    subject,
    html: html || message,
  });
};

module.exports = sendEmail;
