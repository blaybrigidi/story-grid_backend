import adminRoutes from './adminRoute.js';
import userRoutes from './userRoute.js';
import friendRoutes from './friendRoute.js';
import authRoutes from './authRoute.js';
import utilRoutes from './utilRoute.js';
import storyRoutes from './storyRoute.js';
import mediaRoutes from './mediaRoute.js';
import feedRoutes from './feedRoute.js';
import messagingRoutes from './messagingRoute.js';
import auth from '../app/middleware/auth.js';

/**
 * Initialize all routes for the application
 * @param {Express.Application} app - Express application instance
 * @param {Express.Router} router - Express router instance
 */
export default function initializeRoutes(app, router) {
  // Mount auth routes first (no auth middleware needed)
  authRoutes(router);
  
  // Mount admin routes
  adminRoutes(router, auth);
  
  // Mount user routes
  userRoutes(router, auth);
  
  // Mount friend routes
  friendRoutes(router, auth);

  // Mount story routes
  storyRoutes(router, auth);
  
  // Mount media routes
  mediaRoutes(router, auth);
  
  // Mount feed routes
  feedRoutes(router, auth);
  
  // Mount messaging routes
  messagingRoutes(router, auth);

  // Mount utility routes (only in development)
  if (process.env.NODE_ENV === 'development') {
    utilRoutes(router);
  }
  
  // Mount router to app
  app.use('/api', router);
  
  // Base route
  app.get('/', (req, res) => {
    res.json({
      status: 200,
      msg: 'Welcome to StoryGrid API',
      data: {
        version: '1.0.0',
        documentation: '/api/docs'
      }
    });
  });
  
  console.log('[INFO] Routes initialized');
}