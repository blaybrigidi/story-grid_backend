/** @format */
import * as userController from "../app/controllers/userController.js";
import * as userValidate from "../app/middleware/validation/userValidate.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, aut) {

   /*-------------------- Onboarding APIs ---------------------------------------------------*/
   router.post("/user/signUp", userValidate.signUp, responseHandler(userController.signup));
   router.post("/user/login", userValidate.valUserLogin, responseHandler(userController.login));
//    router.get("/user/resendOtp", aut.verifyToken, responseHandler(userController.resendOtp));
//    router.post("/user/otpVerification", userValidate.otpVerification, aut.verifyToken, responseHandler(userController.verifyOtp));
//    router.post("/user/updateUsernameAndPhone", userValidate.validateUsernameAndPhoneUpdate, aut.verifyToken, responseHandler(userController.updateUsernameAndPhone));
//    router.post("/user/login", userValidate.valUserLogin, responseHandler(userController.userLogin));
//    router.get("/user/logout", aut.verifyToken, aut.isUserVerified, aut.destroyToken);
//    router.get("/user/deleteAccount", aut.verifyToken, aut.isUserVerified, responseHandler(userController.deleteUserAccount));
   
//    /*--------------------------------------User Profile----------------------------------------------*/
//    router.get("/user/getUserProfile", aut.verifyToken, aut.isUserVerified, responseHandler(userController.userProfile));
//    router.post("/user/forgotPassword", userValidate.valUserForgotPassword, responseHandler(userController.initiatePasswordReset));
//    router.post("/user/validateResetToken", userValidate.validateResetToken, responseHandler(userController.validateResetToken));
//    router.post("/user/resetPassword", responseHandler(userController.resetPassword));
//    router.post("/user/updateAddress", aut.verifyToken, aut.isUserVerified, userValidate.validateAddressUpdate, responseHandler(userController.updateAddress));
//    router.post("/user/initiateEmailUpdate", 
//        aut.verifyToken, aut.isUserVerified, userValidate.validateEmailUpdate, responseHandler(userController.initiateEmailUpdate)
//    );

//    router.post("/user/verifyNewEmail",
//        aut.verifyToken, userValidate.validateEmailVerification, responseHandler(userController.verifyNewEmail));


//    router.post("/user/verifyNewPhone",
//        aut.verifyToken, aut.isUserVerified, responseHandler(userController.verifyNewPhone)
//    );

//    router.post("/user/reportProblem",
//       aut.verifyToken, aut.isUserVerified, responseHandler(userController.reportProblem)
//   );

}
