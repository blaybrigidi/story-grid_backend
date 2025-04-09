import adminRoutes from './admin.routes.js';
import auth from '../app/middleware/auth/auth.js';

/**
 * Initialize all routes for the application
 * @param {Express.Application} app - Express application instance
 * @param {Express.Router} router - Express router instance
 */
export default function initializeRoutes(app, router) {
  // Mount admin routes
  adminRoutes(router, auth);
  
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