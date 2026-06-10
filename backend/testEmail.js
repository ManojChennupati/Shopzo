import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Email Service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service verification FAILED:');
        console.error(error);
    } else {
        console.log('✅ Email service is ready!');
        
        // Send test email
        const mailOptions = {
            from: {
                name: 'Shopzo Test',
                address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
            subject: 'Test Email - Shopzo',
            html: '<h1>Test Email</h1><p>If you receive this, email service is working!</p>'
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('❌ Failed to send test email:');
                console.error(err);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
            }
            process.exit();
        });
    }
});
