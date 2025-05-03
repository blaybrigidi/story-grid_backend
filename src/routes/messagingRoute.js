/** @format */
import * as messagingController from "../app/controllers/messagingController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
   
   /*-------------------- Messaging APIs ---------------------------------------------------*/
   
   /**
    * @route POST /api/messaging/createConversation
    * @description Create a new conversation with one or more users
    * @access Private - Requires authentication
    */
   router.post("/messaging/createConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.createConversation)
   );
   
   /**
    * @route POST /api/messaging/sendMessage
    * @description Send a message in a conversation
    * @access Private - Requires authentication
    */
   router.post("/messaging/sendMessage", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.sendMessage)
   );
   
   /**
    * @route POST /api/messaging/getMessages
    * @description Get messages from a conversation
    * @access Private - Requires authentication
    */
   router.post("/messaging/getMessages", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.getMessages)
   );
   
   /**
    * @route POST /api/messaging/getConversations
    * @description Get all conversations for the current user
    * @access Private - Requires authentication
    */
   router.post("/messaging/getConversations", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.getConversations)
   );
   
   /**
    * @route POST /api/messaging/addParticipant
    * @description Add a participant to a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.post("/messaging/addParticipant", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.addParticipant)
   );
   
   /**
    * @route POST /api/messaging/removeParticipant
    * @description Remove a participant from a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.post("/messaging/removeParticipant", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.removeParticipant)
   );
   
   /**
    * @route POST /api/messaging/leaveConversation
    * @description Leave a conversation
    * @access Private - Requires authentication
    */
   router.post("/messaging/leaveConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.leaveConversation)
   );
   
   /**
    * @route POST /api/messaging/deleteConversation
    * @description Delete a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.post("/messaging/deleteConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.deleteConversation)
   );
} 