import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function run() {
  console.log("Testing email with user:", process.env.EMAIL_USER);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'chennupatimanojkumar7@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    });
    console.log("Success:", info.messageId);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
