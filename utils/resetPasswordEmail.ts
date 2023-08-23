import nodemailer from "nodemailer";
import { UserType } from "../models/userModel";
import User from "../models/userModel";

const sendResetPasswordEmail = async (user: UserType, resetToken: string) => {
  const transporter = nodemailer.createTransport({
    // Configure your email transport here (e.g., SMTP, Gmail, etc.)
  });

  const resetLink = `http://yourwebsite.com/reset-password/${resetToken}`;

  const mailOptions = {
    from: "your@email.com",
    to: user.email,
    subject: "Reset Your Password",
    html: `Click <a href="${resetLink}">here</a> to reset your password.`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetPasswordEmail;
