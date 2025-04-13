import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 401,
            msg: 'Authentication token required',
            data: null
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 403,
                msg: 'Invalid or expired token',
                data: null
            });
        }
        req.user = user;
        next();
    });
};

// Handle Google OAuth callback
export const googleCallback = async (req) => {
    try {
        const user = req.user;
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            status: 200,
            msg: 'Google authentication successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePicture: user.profilePicture
                },
                token
            }
        };
    } catch (error) {
        console.error('Google callback error:', error);
        return {
            status: 500,
            msg: 'Authentication failed',
            data: null
        };
    }
};

// Get current user info
export const getCurrentUser = async (req) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'email', 'firstName', 'lastName', 'profilePicture']
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
            msg: 'User info retrieved successfully',
            data: user
        };
    } catch (error) {
        console.error('Get current user error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve user info',
            data: null
        };
    }
};

// Handle logout
export const logout = async (req) => {
    try {
        // In a token-based system, the client should discard the token
        // Here we can perform any necessary cleanup
        return {
            status: 200,
            msg: 'Logged out successfully',
            data: null
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            status: 500,
            msg: 'Logout failed',
            data: null
        };
    }
}; 