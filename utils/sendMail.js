// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // use TLS
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.GMAIL_USER,
//       to,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error("Email sending failed:", err);
//     throw new Error("Failed to send email");
//   }
// };



import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Create a test Ethereal account
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Verify" <no-reply@example.com>',
      to,
      subject,
      html,
    });

    // Return the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Email sent! Preview URL:", previewUrl);

    return previewUrl;
  } catch (err) {
    console.error("Ethereal Email Error:", err);
    throw new Error("Failed to send email");
  }
};






// import { Resend } from "resend";
// import dotenv from "dotenv";
// dotenv.config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await resend.emails.send({
//       from: "Verify <onboarding@resend.dev>",  // MUST be resend.dev
//       to,
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error("Resend Email Error:", err);
//     throw new Error("Failed to send email");
//   }
// };
