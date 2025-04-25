import * as secure from "../helper/secure.js";

/**
 * Response handler wrapper that standardizes API responses
 * @param {Function} controllerFunction - The controller function to wrap
 * @returns {Function} - Express middleware function
 */
export default (controllerFunction) => async (request, response, next) => {
    try {
        const result = await controllerFunction(request);
        console.log("Controller response:", result);

        let encrypted_response = null;
        if (result.data) {
            try {
                encrypted_response = secure.encrypt(JSON.stringify(result.data));
                console.log("Encrypted response data:", encrypted_response);
            } catch (encryptionError) {
                console.error("Encryption error:", encryptionError);
                if (!response.headersSent) {
                    return response.status(500).json({
                        status: 500,
                        msg: "Failed to encrypt response",
                        data: null,
                    });
                }
            }
        } else {
            console.warn("No data to encrypt, received:", result.data);
        }

        if (!response.headersSent) {
            // Set a custom header to indicate this is an encrypted response
            response.setHeader('x-encrypted', 'true');
            
            // Return the response as a string, not as JSON
            return response.status(+result.status).send(JSON.stringify({
                status: result.status,
                msg: result.msg,
                meta: result.meta,
                data: encrypted_response,
            }));
        }
    } catch (error) {
        console.error("Error in response handler:", error);

        if (!response.headersSent) {
            return response.status(400).json({
                status: false,
                message: "Something went wrong",
                data: [],
            });
        }
    }
}; 