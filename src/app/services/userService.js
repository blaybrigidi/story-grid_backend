import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOTP } from '../utils/email.js';
import { generateToken, verifyPassword, hashPassword } from '../helper/secure.js';
import { Op } from 'sequelize';

export const register = async (userData) => {
    try {
        console.log('Registering user with data:', JSON.stringify(userData, null, 2));
        const { email, password, username } = userData;

        // Check if user already exists with this email
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            console.log('User with email already exists:', email);
            return {
                status: 400,
                msg: 'User with this email already exists',
                data: null
            };
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            console.log('Username already taken:', username);
            return {
                status: 400,
                msg: 'Username is already taken',
                data: null
            };
        }

        console.log('Creating new user with username:', username);
        // Create new user - password will be hashed by the User model's beforeCreate hook
        const user = await User.create({
            username,
            email,
            password // Pass the plain password, let the model hash it
        });
        console.log('User created successfully with ID:', user.id);

        // Generate JWT token
        console.log('Generating token for user:', user.id);
        const token = generateToken(user);
        console.log('Token generated successfully');

        return {
            status: 201,
            msg: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                token
            }
        };
    } catch (error) {
        console.error('Register error:', error);
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
        console.log('Login attempt for email:', email);
        console.log('Password provided:', password);
        
        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found with email:', email);
            return {
                status: 401,
                msg: "Invalid credentials",
                data: null
            };
        }
        
        console.log('User found:', user.id);
        console.log('Username:', user.username);
        console.log('Stored password hash:', user.password);
        console.log('Password hash length:', user.password.length);
        console.log('Password hash format:', user.password.startsWith('$2a$') ? 'bcrypt' : 'unknown');
        
        // Check if account is blocked
        if (user.isBlocked) {
            console.log('User account is blocked:', user.id);
            return {
                status: 403,
                msg: "Account is blocked",
                data: null
            };
        }
        
        // Verify password using bcrypt directly
        console.log('Verifying password for user:', user.id);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password verification result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Invalid password for user:', user.id);
            return {
                status: 401,
                msg: "Invalid credentials",
                data: null
            };
        }
        
        // Generate JWT token
        const token = generateToken(user);
        
        return {
            status: 200,
            msg: "Login successful",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                token
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
};

/**
 * Search users by username or email
 * @param {string} query - Search query for username or email
 * @param {number} limit - Maximum number of results to return
 * @returns {Object} - Response with status, message, and data
 */
export const searchUsers = async (query, limit = 10) => {
  try {
    if (!query || query.trim() === '') {
      return {
        status: 400,
        msg: 'Search query is required',
        data: null
      };
    }

    // Search by username or email
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'username', 'email', 'role'],
      limit: parseInt(limit)
    });

    return {
      status: 200,
      msg: 'Users found successfully',
      data: users
    };
  } catch (error) {
    console.error('Search users error:', error);
    return {
      status: 500,
      msg: 'Failed to search users',
      data: null
    };
  }
};
