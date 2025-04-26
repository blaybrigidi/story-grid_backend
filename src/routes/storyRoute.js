/** @format */
import * as storyController from "../app/controllers/storyController.js";
import * as mediaController from "../app/controllers/mediaController.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, auth) {

   /*-------------------- Story APIs ---------------------------------------------------*/
   router.post("/story/createStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.createStory)
   );
   
   router.post("/story/getStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.getStory)
   );
   
   router.post("/story/deleteStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.deleteStory)
   );
   
   router.post("/story/likeStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.likeStory)
   );
   
   router.post("/story/unlikeStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.unlikeStory)
   );
   
   router.post("/story/commentStory", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.commentStory)
   );
   
   router.post("/story/getComments", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.getComments)
   );
   
   router.post("/story/deleteComment", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.deleteComment)
   );
   
   router.post("/story/getDashboardStories", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(storyController.getDashboardStories)
   );

   /*-------------------- Media APIs ---------------------------------------------------*/
   router.post("/media/upload", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(mediaController.uploadMedia)
   );
   
   router.post("/media/delete", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(mediaController.deleteMedia)
   );
}
