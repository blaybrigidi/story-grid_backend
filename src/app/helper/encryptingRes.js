import * as secure from "./secure.js";

/**
 * Response handler wrapper that standardizes API responses
 * @param {Function} controllerFunction - The controller function to wrap
 * @returns {Function} - Express middleware function
 */
export default (controllerFunction) => async (request, response, next) => {
    try {
        const result = await controllerFunction(request);
        console.log("Controller response:", result);

        // Return the data as a plain object, not encrypted
        if (!response.headersSent) {
            return response.status(+result.status).json({
                status: result.status,
                msg: result.msg,
                meta: result.meta,
                data: result.data,
            });
        }
    } catch (error) {
        console.error("Error in response handler:", error);
        if (!response.headersSent) {
            return response.status(500).json({
                status: 500,
                msg: "Internal server error",
                data: null
            });
        }
    }
};