require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async ({to, subject, text}) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text
  };
  await transporter.sendMail(mailOptions);
};
