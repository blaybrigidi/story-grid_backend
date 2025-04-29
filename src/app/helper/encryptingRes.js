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
            return response.status(400).json({
                status: false,
                message: "Something went wrong",
                data: [],
            });
        }
    }
}; 