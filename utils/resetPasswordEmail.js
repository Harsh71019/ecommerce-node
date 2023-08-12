import nodemailer from 'nodemailer';

const sendResetPasswordEmail = async (user, resetToken) => {
  const transporter = nodemailer.createTransport({
    // Configure your email transport here (e.g., SMTP, Gmail, etc.)
  });

  const resetLink = `http://yourwebsite.com/reset-password/${resetToken}`;

  const mailOptions = {
    from: 'your@email.com',
    to: user.email,
    subject: 'Reset Your Password',
    html: `Click <a href="${resetLink}">here</a> to reset your password.`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetPasswordEmail;
