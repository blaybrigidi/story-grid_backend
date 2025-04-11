/** @format */
import { body, validationResult } from 'express-validator';

export const validateFriendRequest = [
    body('friendId')
        .isInt()
        .withMessage('Friend ID must be a valid integer')
        .notEmpty()
        .withMessage('Friend ID is required'),
    
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