/** @format */
import * as mediaController from "../app/controllers/mediaController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
   /*-------------------- Media APIs ---------------------------------------------------*/
   
   /**
    * @route POST /api/media/upload
    * @description Upload media file to Cloudinary and optionally associate with a story
    * @access Private - Requires authentication
    */
   router.post("/media/upload", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(mediaController.uploadMedia)
   );
   
   /**
    * @route POST /api/media/delete
    * @description Delete media from Cloudinary and database
    * @access Private - Requires authentication
    */
   router.post("/media/delete", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(mediaController.deleteMedia)
   );
} 