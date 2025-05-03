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

/**
 * Controller for creating a new conversation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const createConversation = async (req) => {
    try {
        const { participantIds, initialMessage, isGroupChat, name } = req.body.data || req.body;
        const userId = req.user.id;

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

        const result = await createConversationService(
            userId, 
            participantIds, 
            initialMessage, 
            isGroupChat, 
            name
        );

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
        const { conversationId, content } = req.body.data || req.body;
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

        const result = await sendMessageService(conversationId, userId, content);

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
        const { conversationId, page, limit } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }

        const result = await getMessagesService(
            conversationId,
            userId,
            parseInt(page) || 1,
            parseInt(limit) || 20
        );

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
        const { conversationId, participantId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId || !participantId) {
            return {
                status: 400,
                msg: "Conversation ID and participant ID are required",
                data: null
            };
        }

        const result = await addParticipantService(conversationId, userId, participantId);

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
        const { conversationId, participantId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId || !participantId) {
            return {
                status: 400,
                msg: "Conversation ID and participant ID are required",
                data: null
            };
        }

        const result = await removeParticipantService(conversationId, userId, participantId);

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
        const { conversationId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }

        const result = await leaveConversationService(conversationId, userId);

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
        const { conversationId } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!conversationId) {
            return {
                status: 400,
                msg: "Conversation ID is required",
                data: null
            };
        }

        const result = await deleteConversationService(conversationId, userId);

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