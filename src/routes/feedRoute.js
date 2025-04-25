/** @format */
import * as feedController from "../app/controllers/feedController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
   
   /*-------------------- Feed APIs ---------------------------------------------------*/
   
   /**
    * @route POST /api/feed/getFeed
    * @description Get stories from friends and own stories for the main feed
    * @access Private - Requires authentication
    */
   router.post("/feed/getFeed", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(feedController.getFeed)
   );
   
   /**
    * @route POST /api/feed/getDiscover
    * @description Get trending stories from all users for the discover feed
    * @access Private - Requires authentication
    */
   router.post("/feed/getDiscover", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(feedController.getDiscover)
   );
} 