import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// ================= OTP EMAIL TEMPLATE =================

const buildOTPEmailHTML = (full_name, otp) => `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg, #6366f1 0%, #7c3aed 100%); padding:32px 24px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                  🔐 Verification Code
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 16px 0; font-size:15px; color:#1e293b;">
                  Hello ${full_name},
                </p>

                <p style="margin:0 0 24px 0; font-size:15px; color:#475569;">
                  Your verification code for the EventNest Management System is ready:
                </p>

                <!-- OTP Box -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:8px 0 24px 0;">
                      <div style="display:inline-block; border:2px dashed #818cf8; background-color:#eef2ff; border-radius:10px; padding:20px 40px;">
                        <span style="font-size:34px; font-weight:700; letter-spacing:8px; color:#4f46e5;">
                          ${otp}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Warning banner -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="background-color:#fef9c3; border-left:4px solid #eab308; border-radius:6px; padding:14px 16px;">
                      <span style="font-size:14px; color:#854d0e;">
                        ⏰ <strong>Important:</strong> This code expires in 5 minutes for security purposes.
                      </span>
                    </td>
                  </tr>
                </table>

                <p style="margin:0; font-size:14px; color:#64748b;">
                  If you didn't request this, please contact your system administrator immediately.
                </p>
              </td>
            </tr>

          </table>

          <!-- Footer -->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center; padding:24px 20px 0 20px;">
                <p style="margin:0; font-size:13px; color:#94a3b8;">
                  Best regards,<br />
                  <strong style="color:#64748b;">EventNest Management System</strong>
                </p>
                <p style="margin:8px 0 0 0; font-size:12px; color:#cbd5e1;">
                  This is an automated message – please do not reply
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendOTP = async (email, otp, full_name = "there") => {
  await transporter.sendMail({
    from: `"EventNest Management System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "EventHub Email Verification",
    text: `Your Registration OTP is ${otp}`, // plain-text fallback for clients that block HTML
    html: buildOTPEmailHTML(full_name, otp),
  });
};

export const notifyAdminNewOrganiser = async (organiser) => {
  const adminEmail = process.env.EMAIL_ADMIN; // the admin's inbox address, set in your .env

  const mailOptions = {
    from: process.env.EMAIL_FROM,
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

  await transporter.sendMail(mailOptions);
};

export const notifyOrganiserDeleted = async (organiser, message) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
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
