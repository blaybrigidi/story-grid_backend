import express from 'express';
import * as authController from '../app/controllers/authController.js';
import responseHandler from '../app/helper/encryptingRes.js';

export default function(router) {
    // Get user info
    router.get('/auth/user',
        authController.authenticateToken,
        responseHandler(authController.getCurrentUser)
    );

    // Logout
    router.post('/auth/logout',
        authController.authenticateToken,
        responseHandler(authController.logout)
    );
} 