import express from 'express';
import passport from 'passport';
import * as authController from '../app/controllers/authController.js';
import responseHandler from '../app/helper/encryptingRes.js';

export default function(router) {
    // Google OAuth routes
    router.get('/auth/google',
        passport.authenticate('google', {
            scope: [
                'profile',
                'email'
            ]
        })
    );

    router.get('/auth/google/callback',
        passport.authenticate('google', { 
            failureRedirect: '/login',
            session: false
        }),
        responseHandler(authController.googleCallback)
    );

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