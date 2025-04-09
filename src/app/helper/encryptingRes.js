/**
 * Response handler wrapper that standardizes API responses
 * @param {Function} controllerFunction - The controller function to wrap
 * @returns {Function} - Express middleware function
 */
export default function responseHandler(controllerFunction) {
    return async (req, res, next) => {
        try {
            // Call the controller function
            const result = await controllerFunction(req, res, next);
            
            // If the controller has already sent a response, don't send another one
            if (res.headersSent) {
                return;
            }
            
            // Standardize the response format
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            // Log the error for debugging
            console.error('API Error:', error);
            
            // If the controller has already sent a response, don't send another one
            if (res.headersSent) {
                return;
            }
            
            // Return a standardized error response
            return res.status(error.status || 500).json({
                success: false,
                message: error.message || 'An unexpected error occurred'
            });
        }
    };
} 