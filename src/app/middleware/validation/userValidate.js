/** @format */
import { body, validationResult } from 'express-validator';

export const signUp = [
    body('data.email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .notEmpty()
        .withMessage('Email is required'),
    
    body('data.username')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
        .notEmpty()
        .withMessage('Username is required'),
    
    body('data.password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .notEmpty()
        .withMessage('Password is required'),
    
    body('data.firstName')
        .isString()
        .withMessage('First name must be a string')
        .optional(),
    
    body('data.lastName')
        .isString()
        .withMessage('Last name must be a string')
        .optional(),
    
    body('data.phoneNumber')
        .isString()
        .withMessage('Phone number must be a string')
        .optional(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const valUserLogin = [
    body('data.email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .notEmpty()
        .withMessage('Email is required'),
    
    body('data.password')
        .notEmpty()
        .withMessage('Password is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const valUserForgotPassword = [
    body('data.email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .notEmpty()
        .withMessage('Email is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const validateResetToken = [
    body('data.token')
        .notEmpty()
        .withMessage('Reset token is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const validateAddressUpdate = [
    body('data.country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const validateEmailUpdate = [
    body('data.newEmail')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .notEmpty()
        .withMessage('New email is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const validateEmailVerification = [
    body('data.token')
        .notEmpty()
        .withMessage('Verification token is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const validateUsernameAndPhoneUpdate = [
    body('data.username')
        .isString()
        .withMessage('Username must be a string')
        .notEmpty()
        .withMessage('Username is required'),
    
    body('data.phone')
        .isString()
        .withMessage('Phone must be a string')
        .notEmpty()
        .withMessage('Phone is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
];

export const otpVerification = [
    body('data.otp')
        .isString()
        .withMessage('OTP must be a string')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 characters long')
        .notEmpty()
        .withMessage('OTP is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 400,
                msg: 'Validation error',
                data: errors.array()
            });
        }
        next();
    }
]; 