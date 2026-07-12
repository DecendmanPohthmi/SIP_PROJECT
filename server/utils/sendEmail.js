import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_USER_PASS
    }
});

const transporterAdmin = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_ADMIN_PASS
    }
});

export const sendOTP = async (email, otp) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "EventHub Email Verification",
        text: `Your Registration OTP is ${otp}`
    });

};

export const notifyAdminNewOrganiser = async (organiser) => {
  const adminEmail = process.env.EMAIL_ADMIN; // set this in your .env

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: "New Organiser Registration — Approval Needed",
    html: `
      <h2>New Organiser Registered</h2>
      <p>A new organiser has completed registration and is awaiting approval.</p>
      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Name:</strong></td><td>${organiser.full_name}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Organisation:</strong></td><td>${organiser.organisation_name || "N/A"}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Email:</strong></td><td>${organiser.email}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0;"><strong>Phone:</strong></td><td>${organiser.phone}</td></tr>
      </table>
      <p style="margin-top: 16px;">Please log in to the admin panel to review and approve or reject this application.</p>
    `,
  };

  await transporter.sendMail(mailOptions); // reuse whatever transporter sendOTP already uses
};

export const notifyOrganiserDeleted = async (organiser, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: organiser.email,
    subject: "Your EventNest Organiser Account Has Been Removed",
    html: `
      <h2>Account Removed</h2>
      <p>Hi ${organiser.full_name},</p>
      <p>Your organiser account on EventNest has been removed by our team. Here's the reason provided:</p>
      <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #555;">
        ${message}
      </blockquote>
      <p>If you believe this was a mistake, please reply to this email or contact our support team.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};