import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email server connection failed:', error.message);
    console.log('⚠️  Email functionality will not work. Please configure SMTP settings in .env');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Unchi Udaan <noreply@unchiudaan.com>',
    to: email,
    subject: 'Verify Your Email - Unchi Udaan',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Unchi Udaan</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with Unchi Udaan. To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
              </div>
              
              <p>If you didn't create an account with Unchi Udaan, please ignore this email.</p>
              
              <p><strong>Why verify your email?</strong></p>
              <ul>
                <li>Access exclusive courses and study materials</li>
                <li>Track your learning progress</li>
                <li>Receive important updates and notifications</li>
              </ul>
              
              <p>Best regards,<br>Team Unchi Udaan</p>
            </div>
            <div class="footer">
              <p>© 2024 Unchi Udaan. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, name: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Unchi Udaan <noreply@unchiudaan.com>',
    to: email,
    subject: 'Password Reset Request - Unchi Udaan',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <p><strong>This link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p>Best regards,<br>Team Unchi Udaan</p>
            </div>
            <div class="footer">
              <p>© 2024 Unchi Udaan. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

export default transporter;
