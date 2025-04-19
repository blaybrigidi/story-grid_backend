import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendOTP } from '../utils/email.js';

// Generate a secure JWT secret if not provided
const getJwtSecret = () => {
    return process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
};

export const register = async (userData) => {
    try {
        const { email, password, username, firstName, lastName, phoneNumber } = userData;

        // Check if user already exists with this email
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            return {
                status: 400,
                msg: 'User with this email already exists',
                data: null
            };
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return {
                status: 400,
                msg: 'Username is already taken',
                data: null
            };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            isBlocked: false
        });

        // Generate JWT token with proper secret
        const token = jwt.sign(
            { id: user.id },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return {
            status: 201,
            msg: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber
                },
                token
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        return {
            status: 500,
            msg: `Registration failed: ${error.message}`,
            data: null
        };
    }
};

export const requestLogin = async (email, password) => {
    try {
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return {
                status: 400,
                msg: 'Invalid credentials',
                data: null
            };
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return {
                status: 403,
                msg: 'Account is blocked. Please contact support.',
                data: null
            };
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return {
                status: 400,
                msg: 'Invalid credentials',
                data: null
            };
        }

        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await sendOTP(email, otp);

        // Store OTP in user session or cache (implementation depends on your session management)
        // For now, we'll assume it's stored somewhere accessible

        return {
            status: 200,
            msg: 'OTP sent successfully',
            data: { email }
        };
    } catch (error) {
        console.error('Login request error:', error);
        return {
            status: 500,
            msg: 'Login request failed',
            data: null
        };
    }
};

export const verifyLogin = async (email, otp) => {
    try {
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return {
                status: 400,
                msg: 'Invalid credentials',
                data: null
            };
        }

        // Verify OTP (implementation depends on your OTP storage)
        // For now, we'll assume it's verified somewhere

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // Provide a default value
        );

        return {
            status: 200,
            msg: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    country: user.country
                }
            }
        };
    } catch (error) {
        console.error('Login verification error:', error);
        return {
            status: 500,
            msg: 'Login verification failed',
            data: null
        };
    }
};

export const getProfile = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'country', 'createdAt']
        });

        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }

        return {
            status: 200,
            msg: 'Profile retrieved successfully',
            data: user
        };
    } catch (error) {
        console.error('Get profile error:', error);
        return {
            status: 500,
            msg: 'Failed to fetch profile',
            data: null
        };
    }
};

export const updateProfile = async (userId, updateData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }

        await user.update(updateData);

        return {
            status: 200,
            msg: 'Profile updated successfully',
            data: user
        };
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            status: 500,
            msg: 'Failed to update profile',
            data: null
        };
    }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return {
                status: 400,
                msg: 'Current password is incorrect',
                data: null
            };
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await user.update({ password: hashedPassword });

        return {
            status: 200,
            msg: 'Password changed successfully',
            data: null
        };
    } catch (error) {
        console.error('Change password error:', error);
        return {
            status: 500,
            msg: 'Failed to change password',
            data: null
        };
    }
};

export const login = async (email, password) => {
    try {
        console.log('Login attempt details:', {
            email,
            passwordLength: password?.length
        });
        
        const user = await User.findOne({ where: { email } });
        console.log('User details:', {
            found: !!user,
            hashedPasswordLength: user?.password?.length,
        });
        
        if (!user) {
            return {
                status: 400,
                msg: 'Invalid credentials',
                data: null
            };
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password comparison:', {
            inputPasswordLength: password?.length,
            storedHashLength: user.password?.length,
            isValid: isValidPassword
        });

        if (!isValidPassword) {
            return {
                status: 400,
                msg: 'Invalid credentials',
                data: null
            };
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return {
                status: 403,
                msg: 'Account is blocked. Please contact support.',
                data: null
            };
        }

        // Generate JWT token using same secret as registration
        const token = jwt.sign(
            { id: user.id },
            getJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Return same user data structure as registration
        return {
            status: 200,
            msg: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber
                },
                token
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            status: 500,
            msg: 'Login failed',
            data: null
        };
    }
};
