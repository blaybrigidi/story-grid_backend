import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = {
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    status: 401,
                    msg: 'Authentication token is required',
                    data: null
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                return res.status(401).json({
                    status: 401,
                    msg: 'User not found',
                    data: null
                });
            }

            if (user.isBlocked) {
                return res.status(403).json({
                    status: 403,
                    msg: 'User is blocked',
                    data: null
                });
            }
            
            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                status: 401,
                msg: 'Invalid or expired token',
                data: null
            });
        }
    },

    verifyAdminToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    status: 401,
                    msg: 'Authentication token is required',
                    data: null
                });
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);
            
            if (!user || user.role !== 'admin') {
                return res.status(403).json({
                    status: 403,
                    msg: 'Admin access required',
                    data: null
                });
            }
            
            req.user = user;
            next();
        } catch (error) {
            console.error('Admin token verification error:', error);
            return res.status(401).json({
                status: 401,
                msg: 'Invalid or expired token',
                data: null
            });
        }
    },

    isUserVerified: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 401,
                msg: 'User not authenticated',
                data: null
            });
        }
        next();
    }
};

export default auth; 