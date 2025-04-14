/** @format */
import * as storyController from "../app/controllers/storyController.js";
import responseHandler from "../app/helper/encryptingRes.js";


export default function (router, aut) {

   /*-------------------- Onboarding APIs ---------------------------------------------------*/
   router.post("/story/createStory", responseHandler(storyController.createStory));
   router.post("/story/getStory", responseHandler(storyController.getStory));
   router.post("/story/deleteStory", responseHandler(storyController.deleteStory));
   router.post("/story/likeStory", responseHandler(storyController.likeStory));
   router.post("/story/unlikeStory", responseHandler(storyController.unlikeStory));
   router.post("/story/commentStory", responseHandler(storyController.commentStory));
   router.post("/story/getComments", responseHandler(storyController.getComments));
   router.post("/story/deleteComment", responseHandler(storyController.deleteComment));
}
