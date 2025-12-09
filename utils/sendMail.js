// import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // use TLS
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// export const sendEmail = async ({ to, subject, html }) => {
//   await transporter.sendMail({
//     from: process.env.GMAIL_USER,
//     to,
//     subject,
//     html,
//   });
// };
// utils/email.js
export const sendEmail = async ({ to, subject, html }) => {
  // Create form data for Elastic Email
  const formData = new URLSearchParams();
  formData.append('apikey', process.env.ELASTIC_EMAIL_API_KEY);
  formData.append('from', process.env.EMAIL_FROM);
  formData.append('fromName', 'Your App');
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('bodyHtml', html);
  formData.append('isTransactional', 'true'); // Important for deliverability

  // Send to Elastic Email API
  const response = await fetch('https://api.elasticemail.com/v2/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const result = await response.json();
  
  // Check if successful
  if (result.success) {
    console.log('✅ Email sent to:', to);
    return true;
  } else {
    console.error('❌ Email failed:', result.error);
    return false;
  }
};