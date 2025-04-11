/** @format */
import nodemailer from 'nodemailer';

/**
 * Create a transporter for sending emails
 * @returns {Promise<nodemailer.Transporter>} - Nodemailer transporter
 */
const createTransporter = async () => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    return transporter;
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<Object>} - Response object
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        return {
            status: 200,
            msg: 'Email sent successfully',
            data: info
        };
    } catch (error) {
        console.error('Send email error:', error);
        return {
            status: 500,
            msg: 'Failed to send email',
            data: null
        };
    }
};

/**
 * Send a verification email with OTP
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise<Object>} - Response object
 */
export const sendVerificationEmail = async (to, otp) => {
    const subject = 'Email Verification';
    const html = `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
    `;
    
    return sendEmail(to, subject, html);
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Response object
 */
export const sendPasswordResetEmail = async (to, resetToken) => {
    const subject = 'Password Reset';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
    `;
    
    return sendEmail(to, subject, html);
};

/**
 * Send a one-time password (OTP) email
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 * @returns {Promise<Object>} - Response object
 */
export const sendOTP = async (to, otp) => {
    const subject = 'Your One-Time Password';
    const html = `
        <h1>One-Time Password</h1>
        <p>Your one-time password is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
    `;
    
    return sendEmail(to, subject, html);
}; 