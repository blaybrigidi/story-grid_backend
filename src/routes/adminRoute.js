/** @format */
import * as adminController from "../app/controllers/adminController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
    // Authentication routes
    router.post("/admin/login", responseHandler(adminController.login));
    
    // Admin creation (protected to ensure only existing admins can create new ones)
    router.post("/admin/create", auth.verifyAdminToken, responseHandler(adminController.createAdmin));
    
    // Public admin creation endpoint for initial admin setup (should be disabled in production)
    // Only enable this temporarily when setting up the first admin, then comment it out
    if (process.env.NODE_ENV === 'development') {
        router.post("/admin/setup", responseHandler(adminController.createAdmin));
    }
    
    // Admin dashboard
    router.get("/admin/dashboard", auth.verifyAdminToken, responseHandler(adminController.getDashboard));
    
    // User management
    router.get("/admin/users", auth.verifyAdminToken, responseHandler(adminController.getAllUsers));
    router.post("/admin/blockUser/:userId", auth.verifyAdminToken, responseHandler(adminController.blockUser));
    router.post("/admin/unblockUser/:userId", auth.verifyAdminToken, responseHandler(adminController.unblockUser));
    router.post("/admin/deleteUser/:userId", auth.verifyAdminToken, responseHandler(adminController.deleteUser));
    
    // Content management
    router.post("/admin/deleteStory/:storyId", auth.verifyAdminToken, responseHandler(adminController.deleteStory));
    router.post("/admin/deleteComment/:commentId", auth.verifyAdminToken, responseHandler(adminController.deleteComment));
    
    // Messaging management
    router.post("/admin/deleteMessage/:messageId", auth.verifyAdminToken, responseHandler(adminController.deleteMessage));
    router.post("/admin/deleteConversation/:conversationId", auth.verifyAdminToken, responseHandler(adminController.deleteConversation));
    
    // Keep deprecated routes for backward compatibility
    router.post("/admin/requestLogin", responseHandler(adminController.requestLogin));
    router.post("/admin/verifyLogin", responseHandler(adminController.verifyLogin));
}
