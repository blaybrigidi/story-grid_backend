import cors from 'cors';

/**
 * Configure CORS for the application
 * @param {Express.Application} app - Express application instance
 */
export default function corsSetup(app) {
  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  // Apply CORS middleware
  app.use(cors(corsOptions));

  // Pre-flight requests
  app.options('*', cors(corsOptions));

  console.log('[INFO] CORS configured successfully');
} 