/** @format */
import {
    createConversation as createConversationService,
    sendMessage as sendMessageService,
    getMessages as getMessagesService,
    getConversations as getConversationsService,
    addParticipant as addParticipantService,
    removeParticipant as removeParticipantService,
    leaveConversation as leaveConversationService,
    deleteConversation as deleteConversationService
} from '../services/messagingService.js';
import Conversation from '../models/Conversation.js';
import { v4 as uuidv4 } from 'uuid';

// Map to store frontend conversation IDs to database UUIDs
const conversationIdMap = new Map();

/**
 * Maps a frontend conversation ID to a database UUID
 * If this is a new frontend ID, creates a new UUID and stores the mapping
 * @param {string} frontendId - Frontend conversation ID
 * @returns {string} - Database UUID
 */
const mapConversationId = async (frontendId) => {
    // If this is a UUID already, return it as is
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(frontendId)) {
        return frontendId;
    }
    
    // If we already have a mapping for this ID, return it
    if (conversationIdMap.has(frontendId)) {
        return conversationIdMap.get(frontendId);
    }
    
    // Try to find an existing conversation with this frontend ID
    try {
        // If this is a new frontend ID, check if a conversation already exists with a matching name
        const existingConversation = await Conversation.findOne({
            where: { name: `frontend_id:${frontendId}` }
        });
        
        if (existingConversation) {
            // Store the mapping for future use
            conversationIdMap.set(frontendId, existingConversation.id);
            return existingConversation.id;
        }
    } catch (error) {
        console.error("Error checking for existing conversation:", error);
    }
    
    // This is a new frontend ID, create a new UUID
    const databaseId = uuidv4();
    conversationIdMap.set(frontendId, databaseId);
    return databaseId;
};

/**
 * Controller for creating a new conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const createConversation = async (req) => {
    try {
        // Handle both data wrapper and direct request formats
        const requestData = req.body.data || req.body;
        
        // Handle both 'participantIds' and 'participants' field names
        const participantIds = requestData.participantIds || requestData.participants;
        
        const { initialMessage, isGroupChat, name } = requestData;
        const userId = req.user.id;

        // Log the extracted data for debugging
        console.log("Creating conversation with:", {
            userId,
            participantIds,
            initialMessage,
            isGroupChat,
            name
        });

        // Validate required fields
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return {
                status: 400,
                msg: "At least one participant is required",
                data: null
            };
        }

        if (isGroupChat && !name) {
            return {
                status: 400,
                msg: "Group chats require a name",
                data: null
            };
        }

        // Frontend may provide a conversation ID
        const frontendId = requestData.conversationId;
        
        const result = await createConversationService(
            userId, 
            participantIds, 
            initialMessage, 
            isGroupChat, 
            frontendId ? `frontend_id:${frontendId}` : name
        );
        
        // If a frontend ID was provided and conversation was created successfully,
        // store the mapping
        if (frontendId && result.status === 201 && result.data?.id) {
            conversationIdMap.set(frontendId, result.data.id);
            
            // Add the frontend ID to the response
            result.data.frontendId = frontendId;
        }

        return {
            status: result.status || 201,
            msg: result.msg || "Conversation created successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Create conversation error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for sending a message
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const sendMessage = async (req) => {
    try {
        let { conversationId, content } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }

        if (!content || content.trim() === '') {
            return {
                status: 400,
                msg: "Message content cannot be empty",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await sendMessageService(databaseConversationId, userId, content);
        
        // If successful, add the frontend ID back to the response
        if (result.status === 201 && conversationId !== databaseConversationId) {
            result.data.frontendConversationId = conversationId;
        }

        return {
            status: result.status || 201,
            msg: result.msg || "Message sent successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Send message error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for getting messages from a conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getMessages = async (req) => {
    try {
        let { conversationId, page, limit } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await getMessagesService(
            databaseConversationId,
            userId,
            parseInt(page) || 1,
            parseInt(limit) || 20
        );
        
        // If successful, add the frontend ID back to the response
        if (result.status === 200 && conversationId !== databaseConversationId) {
            result.data.frontendConversationId = conversationId;
        }

        return {
            status: result.status || 200,
            msg: result.msg || "Messages retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get messages error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for getting a user's conversations
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getConversations = async (req) => {
    try {
        const { page, limit } = req.body.data || req.body || {};
        const userId = req.user.id;

        const result = await getConversationsService(
            userId,
            parseInt(page) || 1,
            parseInt(limit) || 10
        );

        // If successful, add frontend IDs to each conversation
        if (result.status === 200 && result.data?.conversations) {
            result.data.conversations = result.data.conversations.map(conversation => {
                // Check if this conversation has a frontend ID in its name
                const frontendIdMatch = conversation.name?.match(/^frontend_id:(.+)$/);
                if (frontendIdMatch) {
                    const frontendId = frontendIdMatch[1];
                    conversation.frontendId = frontendId;
                    
                    // Store/update the mapping
                    conversationIdMap.set(frontendId, conversation.id);
                }
                return conversation;
            });
        }

        return {
            status: result.status || 200,
            msg: result.msg || "Conversations retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get conversations error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for adding a participant to a conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const addParticipant = async (req) => {
    try {
        let { conversationId, participantId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId || !participantId) {
            return {
                status: 400,
                msg: "Conversation ID and participant ID are required",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await addParticipantService(databaseConversationId, userId, participantId);

        return {
            status: result.status || 201,
            msg: result.msg || "Participant added successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Add participant error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for removing a participant from a conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const removeParticipant = async (req) => {
    try {
        let { conversationId, participantId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId || !participantId) {
            return {
                status: 400,
                msg: "Conversation ID and participant ID are required",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await removeParticipantService(databaseConversationId, userId, participantId);

        return {
            status: result.status || 200,
            msg: result.msg || "Participant removed successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Remove participant error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for leaving a conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const leaveConversation = async (req) => {
    try {
        let { conversationId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await leaveConversationService(databaseConversationId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Left conversation successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Leave conversation error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for deleting a conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const deleteConversation = async (req) => {
    try {
        let { conversationId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }
        
        // Map frontend ID to database ID
        const databaseConversationId = await mapConversationId(conversationId);

        const result = await deleteConversationService(databaseConversationId, userId);
        
        // If successful, remove the mapping
        if (result.status === 200 && conversationId !== databaseConversationId) {
            conversationIdMap.delete(conversationId);
        }

        return {
            status: result.status || 200,
            msg: result.msg || "Conversation deleted successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Delete conversation error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
}; 