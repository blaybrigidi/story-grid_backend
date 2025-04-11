import * as secure from "../helper/secure.js";

/**
 * Response handler wrapper that standardizes API responses
 * @param {Function} controllerFunction - The controller function to wrap
 * @returns {Function} - Express middleware function
 */
export default (controllerFunction) => async (request, response, next) => {
    try {
        const { status = 200, ...resObj } = await controllerFunction(request, response, next);
        console.log("Controller response:", resObj);

        let encrypted_response = null;
        if (resObj.data) {
            try {
                encrypted_response = secure.encrypt(JSON.stringify(resObj.data));
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
            console.warn("No data to encrypt, received:", resObj.data);
        }

        if (!response.headersSent) {
            return response.status(+status).json({
                status,
                msg: resObj.msg,
                meta: resObj.meta,
                data: encrypted_response,
            });
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