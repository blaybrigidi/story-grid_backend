import * as secure from './secure.js';

/**
 * Middleware to decrypt request data if needed
 * @param {Express.Application} app - Express application instance
 */
export default function decryptReq(app) {
  app.use((req, res, next) => {
    // Skip decryption for certain routes
    const skipDecryptionRoutes = [
      '/ping',
      '/webhooks/yellowcard-moneylink',
      '/api/didit/processDiditWebhooks'
    ];
    
    if (skipDecryptionRoutes.includes(req.path)) {
      return next();
    }
    
    try {
      if (req.body && req.body.data) {
        // If the data is already an object, don't try to decrypt
        if (typeof req.body.data === 'string') {
          const decryptedData = secure.decrypt(req.body.data);
          req.body.data = decryptedData;
        }
      }
      next();
    } catch (error) {
      console.error('[ERROR] Request decryption failed:', error);
      return res.status(400).json({
        status: 400,
        msg: 'Failed to decrypt request data',
        data: null
      });
    }
  });
  
  console.log('[INFO] Request decryption middleware configured');
}