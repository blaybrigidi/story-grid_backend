/** @format */
import * as userController from "../app/controllers/userController.js";
import * as userValidate from "../app/middleware/validation/userValidate.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, auth) {

   /*-------------------- Onboarding APIs ---------------------------------------------------*/
   router.post("/user/signUp", userValidate.signUp, responseHandler(userController.signup));
   router.post("/user/login", userValidate.valUserLogin, async (req, res) => {
      const result = await userController.login(req);
      console.log("Login endpoint response:", JSON.stringify(result, null, 2)); // <-- Add this line
      res.status(result.status).json(result);
   });
   
   /*-------------------- User Search API ---------------------------------------------------*/
   // POST endpoint for search
   router.post("/users/search", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(userController.searchUsers)
   );
   
   // GET endpoint for search with query parameter
   router.get("/users", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         try {
            // Add search query to request body format expected by controller
            req.body = { 
               data: { 
                  query: req.query.search 
               } 
            };
            
            const result = await userController.searchUsers(req);
            return res.status(result.status).json(result);
         } catch (error) {
            console.error("User search error:", error);
            return res.status(500).json({
               status: 500,
               msg: "Internal Server Error",
               data: null
            });
         }
      }
   );
}
