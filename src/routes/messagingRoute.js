/** @format */
import * as messagingController from "../app/controllers/messagingController.js";
import responseHandler from "../app/helper/encryptingRes.js";

export default function (router, auth) {
   
   /*-------------------- Messaging APIs ---------------------------------------------------*/
   
   /**
    * @route GET /api/conversations
    * @description Get all conversations for the current user
    * @access Private - Requires authentication
    */
   router.get("/conversations", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Format request for existing controller
         req.body = req.body || {};
         const result = await messagingController.getConversations(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route POST /api/conversations
    * @description Create a new conversation with one or more users
    * @access Private - Requires authentication
    */
   router.post("/conversations", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         const result = await messagingController.createConversation(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route GET /api/conversations/:conversationId/messages
    * @description Get messages from a conversation
    * @access Private - Requires authentication
    */
   router.get("/conversations/:conversationId/messages", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Format request for existing controller
         req.body = req.body || {};
         req.body.data = req.body.data || {};
         req.body.data.conversationId = req.params.conversationId;
         
         // Add pagination from query params if available
         if (req.query.page) req.body.data.page = req.query.page;
         if (req.query.limit) req.body.data.limit = req.query.limit;
         
         const result = await messagingController.getMessages(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route POST /api/conversations/:conversationId/messages
    * @description Send a message in a conversation
    * @access Private - Requires authentication
    */
   router.post("/conversations/:conversationId/messages", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Ensure conversationId is in the expected format
         req.body.data = req.body.data || req.body;
         req.body.data.conversationId = req.params.conversationId;
         
         const result = await messagingController.sendMessage(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route POST /api/conversations/:conversationId/participants
    * @description Add a participant to a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.post("/conversations/:conversationId/participants", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Ensure conversationId is in the expected format
         req.body.data = req.body.data || req.body;
         req.body.data.conversationId = req.params.conversationId;
         
         const result = await messagingController.addParticipant(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route DELETE /api/conversations/:conversationId/participants/:participantId
    * @description Remove a participant from a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.delete("/conversations/:conversationId/participants/:participantId", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Ensure ids are in the expected format
         req.body.data = req.body.data || {};
         req.body.data.conversationId = req.params.conversationId;
         req.body.data.participantId = req.params.participantId;
         
         const result = await messagingController.removeParticipant(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route DELETE /api/conversations/:conversationId/leave
    * @description Leave a conversation
    * @access Private - Requires authentication
    */
   router.delete("/conversations/:conversationId/leave", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Ensure conversationId is in the expected format
         req.body.data = req.body.data || {};
         req.body.data.conversationId = req.params.conversationId;
         
         const result = await messagingController.leaveConversation(req);
         res.status(result.status).json(result);
      }
   );
   
   /**
    * @route DELETE /api/conversations/:conversationId
    * @description Delete a conversation
    * @access Private - Requires authentication and admin status in conversation
    */
   router.delete("/conversations/:conversationId", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Ensure conversationId is in the expected format
         req.body.data = req.body.data || {};
         req.body.data.conversationId = req.params.conversationId;
         
         const result = await messagingController.deleteConversation(req);
         res.status(result.status).json(result);
      }
   );
   
   // Keep the original routes for backward compatibility
   router.post("/messaging/createConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         // Log the raw request for debugging
         console.log("Legacy createConversation request body:", req.body);
          
         // Handle the participants field format
         if (req.body.data && req.body.data.participants) {
            // Create a compatible format for the controller
            req.body.data.participantIds = req.body.data.participants;
         } else if (req.body.participants) {
            req.body.participantIds = req.body.participants;
         }
          
         const result = await messagingController.createConversation(req);
         res.status(result.status).json(result);
      }
   );
   
   router.post("/messaging/sendMessage", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         console.log("Legacy sendMessage request body:", req.body);
         
         // Ensure proper format for controller
         const result = await messagingController.sendMessage(req);
         res.status(result.status).json(result);
      }
   );
   
   router.post("/messaging/getMessages", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         console.log("Legacy getMessages request body:", req.body);
         
         // Ensure proper format for controller
         const result = await messagingController.getMessages(req);
         res.status(result.status).json(result);
      }
   );
   
   router.post("/messaging/getConversations", 
      auth.verifyToken, 
      auth.isUserVerified, 
      async (req, res) => {
         console.log("Legacy getConversations request body:", req.body);
         
         // Ensure proper format for controller
         const result = await messagingController.getConversations(req);
         res.status(result.status).json(result);
      }
   );
   
   router.post("/messaging/addParticipant", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.addParticipant)
   );
   
   router.post("/messaging/removeParticipant", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.removeParticipant)
   );
   
   router.post("/messaging/leaveConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.leaveConversation)
   );
   
   router.post("/messaging/deleteConversation", 
      auth.verifyToken, 
      auth.isUserVerified, 
      responseHandler(messagingController.deleteConversation)
   );
} 