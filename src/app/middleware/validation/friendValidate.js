/** @format */
import { body, validationResult } from 'express-validator';

export const validateFriendRequest = [
    body('friendId')
        .isString()
        .withMessage('Friend ID must be a valid UUID string')
        .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
        .withMessage('Friend ID must be a valid UUID format')
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