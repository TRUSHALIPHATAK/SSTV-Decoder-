// backend/utils/emailService.js
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

// Debug: Check if credentials are loaded
console.log("🔍 Checking email credentials...");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ MISSING");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ EXISTS (hidden)" : "❌ MISSING");

// Validate credentials before creating transporter
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ CRITICAL: EMAIL_USER or EMAIL_PASS not found in .env file!");
  console.error("Please check your .env file in the backend folder.");
}

// Create reusable transporter with explicit configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates (for development)
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. EMAIL_USER and EMAIL_PASS are set in .env');
    console.error('   2. You\'re using a Gmail App Password (not regular password)');
    console.error('   3. 2-Step Verification is enabled on your Google account');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// ==================== SEND MAGIC LINK FOR LOGIN ====================
export const sendMagicLink = async (email, token) => {
  const magicLink = `${process.env.FRONTEND_URL}/verify-login?token=${token}`;
  
  const mailOptions = {
    from: `"SSTV TEAM @ NLL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your Login Link - VU2CWN',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .button { display: inline-block; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛰️ Ham Radio Network</h1>
            </div>
            <h2>Login to Your Account</h2>
            <p>Click the button below to securely log in to your account:</p>
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Log In Now</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${magicLink}</p>
            <p><strong>This link expires in 15 minutes.</strong></p>
            <div class="footer">
              <p>If you didn't request this login link, please ignore this email.</p>
              <p>© ${new Date().getFullYear()} Ham Radio Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Magic link sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending magic link:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SEND PASSWORD RESET CODE ====================
export const sendPasswordResetCode = async (email, code) => {
  const mailOptions = {
    from: `"SSTV TEAM @ NLL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔒 Password Reset Code - VU2CWN',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .code-box { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛰️ VU2CWN Club</h1>
            </div>
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Use the code below:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p><strong>This code expires in 15 minutes.</strong></p>
            <p>Enter this code on the password reset page to create a new password.</p>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
              <p>© ${new Date().getFullYear()} Ham Radio Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Reset code sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending reset code:', error);
    return { success: false, error: error.message };
  }
};

// ==================== SEND WELCOME EMAIL (OPTIONAL) ====================
export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: `"SSTV TEAM @ NLL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to VU2CWN Club!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛰️ Ham Radio Network</h1>
            </div>
            <h2>Welcome, ${username}! 👋</h2>
            <p>Thank you for joining the Ham Radio Network community!</p>
            <p>You're now part of a global network of radio enthusiasts. Start exploring, connecting, and communicating!</p>
            <p>Happy transmitting! 📡</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ham Radio Network. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};