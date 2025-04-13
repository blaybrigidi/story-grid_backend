import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTP } from '../utils/email.js';

class UserService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Created user object
     */
    async register(userData) {
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

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
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
    }

    /**
     * Request login and send OTP
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login request response
     */
    async requestLogin(email, password) {
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
    }

    /**
     * Verify OTP and complete login
     * @param {string} email - User email
     * @param {string} otp - One-time password
     * @returns {Promise<Object>} - Login response with token
     */
    async verifyLogin(email, otp) {
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
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
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
    }

    /**
     * Get user profile
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - User profile
     */
    async getProfile(userId) {
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
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} updateData - Profile update data
     * @returns {Promise<Object>} - Updated user profile
     */
    async updateProfile(userId, updateData) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    status: 404,
                    msg: 'User not found',
                    data: null
                };
            }

            // Update allowed fields
            const allowedFields = ['firstName', 'lastName', 'country'];
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    user[field] = updateData[field];
                }
            }

            await user.save();
            
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
    }

    /**
     * Change user password
     * @param {number} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} - Success message
     */
    async changePassword(userId, currentPassword, newPassword) {
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
            user.password = hashedPassword;
            await user.save();

            return {
                status: 200,
                msg: 'Password updated successfully',
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
    }

    async login(email, password) {
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

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return {
                status: 200,
                msg: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber
                    }
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
    }
}

export default new UserService();
