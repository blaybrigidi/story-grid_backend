/** @format */
import * as userController from "../app/controllers/userController.js";
import * as userValidate from "../app/middleware/validation/userValidate.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, aut) {

   /*-------------------- Onboarding APIs ---------------------------------------------------*/
   router.post("/user/signUp", userValidate.signUp, responseHandler(userController.signup));
   router.post("/user/login", userValidate.valUserLogin, responseHandler(userController.login));
}
