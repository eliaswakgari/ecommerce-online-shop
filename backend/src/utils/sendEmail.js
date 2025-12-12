const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, message, email, resetUrl }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Changed from SendGrid to Gmail for easier setup
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });

  // If it's a password reset email, create a better HTML template
  let emailHtml = html || message;
  if (resetUrl) {
    emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">E-Commerce Store</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Password Reset Request</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Reset Your Password</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
            You are receiving this email because you (or someone else) has requested the reset of a password for your account.
          </p>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
            Please click on the following button to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #007bff; word-break: break-all; font-size: 14px; margin: 5px 0 0 0;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
            If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #999; font-size: 12px; margin: 0;">
            This link will expire in 10 minutes for security reasons.
          </p>
        </div>
      </div>
    `;
  }

  await transporter.sendMail({
    from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
    to: to || email,
    subject,
    html: emailHtml,
    text: message, // Fallback text version
  });
};

module.exports = sendEmail;
