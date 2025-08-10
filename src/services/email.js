import nodemailer from "nodemailer";

export async function sendMail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to, subject, text, html
  });
  return info;
}
