/** @format */

/**
 * Global error handler middleware
 * @param {Express.Application} app - Express application instance
 */
export default function errorHandler(app) {
  app.use((err, req, res, next) => {
    console.error('[ERROR] Global error caught:', err);
    
    // Format error for frontend
    const errorResponse = {
      status: err.status || 500,
      msg: err.message || 'Internal Server Error',
      data: null,
      error: {
        code: err.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
    
    res.status(errorResponse.status).json(errorResponse);
  });
} 