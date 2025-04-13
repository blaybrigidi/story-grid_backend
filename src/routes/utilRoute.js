/** @format */
import * as utilController from "../app/controllers/utilController.js";

export default function (router) {
    // Only enable this route in development
    if (process.env.NODE_ENV === 'development') {
        router.post("/util/decrypt", async (req, res) => {
            const result = await utilController.decrypt(req);
            res.status(result.status).json(result);
        });
    }
} 