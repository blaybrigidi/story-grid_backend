/** @format */
import * as userController from "../app/controllers/userController.js";
import * as userValidate from "../app/middleware/validation/userValidate.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, aut) {

   /*-------------------- Onboarding APIs ---------------------------------------------------*/
   router.post("/user/signUp", userValidate.signUp, responseHandler(userController.signup));
   router.post("/user/login", userValidate.valUserLogin, async (req, res) => {
      const result = await userController.login(req);
      console.log("Login endpoint response:", JSON.stringify(result, null, 2)); // <-- Add this line
      res.status(result.status).json(result);
  });
}
