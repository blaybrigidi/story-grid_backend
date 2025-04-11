/** @format */
import * as adminController from "../app/controllers/adminController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
    // Admin routes
    router.get("/admin/dashboard", auth.verifyAdminToken, responseHandler(adminController.getDashboard));
    router.get("/admin/users", auth.verifyAdminToken, responseHandler(adminController.getAllUsers));
    router.post("/admin/blockUser/:userId", auth.verifyAdminToken, responseHandler(adminController.blockUser));
    router.post("/admin/unblockUser/:userId", auth.verifyAdminToken, responseHandler(adminController.unblockUser));
}
