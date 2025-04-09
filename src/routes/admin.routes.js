import * as adminController from "../app/controllers/adminController.js";
import * as adminTransactionController from "../app/controllers/adminTransactionController.js";
import responseHandler from "../app/helper/encryptingRes.js";
import * as adminUserController from "../app/controllers/adminUserController.js";

export default function (router, aut) {
    console.log("Available controller functions:", Object.keys(adminUserController));
    
    /*-------------------- Onboarding APIs ---------------------------------------------------*/
    router.post("/admin/requestLogin", responseHandler(adminController.requestLogin));
    router.post("/admin/login", responseHandler(adminController.verifyLogin));

    // User management
    router.post("/admin/blockUser", aut.verifyAdminToken, responseHandler(adminController.blockUser));
    router.post("/admin/unblockUser", aut.verifyAdminToken, responseHandler(adminController.unblockUser));

    // User data
    router.post("/admin/users/getUsers", aut.verifyAdminToken, responseHandler(adminUserController.getAllUsers));
    router.post("/admin/users/getUserDetails", aut.verifyAdminToken, responseHandler(adminUserController.getUserDetails));

    // Metrics
    router.post("/admin/users/getUserMetrics", aut.verifyAdminToken, responseHandler(adminUserController.getUserMetrics));
    router.post("/admin/getTransactionMetrics", aut.verifyAdminToken, responseHandler(adminTransactionController.getTransactionMetrics));
    router.post("/admin/getRevenueMetrics", aut.verifyAdminToken, responseHandler(adminTransactionController.getRevenueMetrics));

    // Banks and transactions
    router.post("/admin/users/getBanks", aut.verifyAdminToken, responseHandler(adminUserController.getAllBanks));
    router.post("/admin/getRecentCurrencySwaps", aut.verifyAdminToken, responseHandler(adminTransactionController.getRecentCurrencySwaps));
    router.post("/admin/getCurrencySwapDetails", aut.verifyAdminToken, responseHandler(adminTransactionController.getCurrencySwapDetails));
    router.post("/admin/getTransactions", aut.verifyAdminToken, responseHandler(adminTransactionController.recentTransactions));

    // KYC
    router.post("/admin/users/kycInformation", aut.verifyAdminToken, responseHandler(adminUserController.fetchAllKYC));

    // Additional endpoints
    router.post("/admin/getTransactionDetails", aut.verifyAdminToken, responseHandler(adminTransactionController.getTransactionDetails));
    router.post("/admin/getCountryDetails", aut.verifyAdminToken, responseHandler(adminUserController.getCountryDetails));
    router.post("/admin/users/getUserPercentage", aut.verifyAdminToken, responseHandler(adminUserController.getUserPercentageByCountry));
    router.post("/admin/users/getSupportedCountries", aut.verifyAdminToken, responseHandler(adminUserController.getAllSupportedCountries));
    router.post("/admin/users/getKycDetails", aut.verifyAdminToken, responseHandler(adminUserController.getKycDetails));
    router.get("/admin/getRevenueList", aut.verifyAdminToken, responseHandler(adminTransactionController.getRevenueList));
    router.post("/admin/bankDetails", aut.verifyAdminToken, responseHandler(adminTransactionController.bankDetails));
} 