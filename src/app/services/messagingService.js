/** @format */
import { Op } from 'sequelize';
import Conversation from '../models/Conversation.js';
import ConversationParticipant from '../models/ConversationParticipant.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';

/**
 * Create a new conversation
 * @param {string} userId - The ID of the user creating the conversation
 * @param {Array<string>} participantIds - Array of participant user IDs
 * @param {string} initialMessage - Initial message to send
 * @param {boolean} isGroupChat - Whether this is a group chat
 * @param {string} name - Name of the group chat (required if isGroupChat is true)
 * @returns {Object} - Response with status, message, and data
 */
export const createConversation = async (userId, participantIds, initialMessage, isGroupChat = false, name = null) => {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
        // Validate input
        if (!userId || !participantIds || participantIds.length === 0) {
            return {
                status: 400,
                msg: 'User ID and at least one participant ID are required',
                data: null
            };
        }

        if (isGroupChat && !name) {
            return {
                status: 400,
                msg: 'Group chats require a name',
                data: null
            };
        }

        // If it's not a group chat, check if a conversation already exists between these users
        if (!isGroupChat && participantIds.length === 1) {
            const existingConversation = await findDirectConversation(userId, participantIds[0]);
            
            if (existingConversation) {
                // If conversation exists and we have an initial message, send it
                if (initialMessage) {
                    const newMessage = await Message.create({
                        conversationId: existingConversation.id,
                        senderId: userId,
                        content: initialMessage
                    }, { transaction });
                    
                    // Update conversation lastMessageAt
                    await existingConversation.update({
                        lastMessageAt: new Date()
                    }, { transaction });
                }
                
                await transaction.commit();
                
                return {
                    status: 200,
                    msg: 'Existing conversation found',
                    data: existingConversation
                };
            }
        }

        // Create a new conversation
        const newConversation = await Conversation.create({
            isGroupChat,
            name: isGroupChat ? name : null,
            lastMessageAt: new Date()
        }, { transaction });

        // Add creator to participants if not already included
        if (!participantIds.includes(userId)) {
            participantIds.push(userId);
        }

        // Add all participants
        const participantPromises = participantIds.map(participantId => 
            ConversationParticipant.create({
                conversationId: newConversation.id,
                userId: participantId,
                isAdmin: participantId === userId // Creator is admin
            }, { transaction })
        );

        await Promise.all(participantPromises);

        // Send initial message if provided
        if (initialMessage) {
            await Message.create({
                conversationId: newConversation.id,
                senderId: userId,
                content: initialMessage
            }, { transaction });
        }

        await transaction.commit();

        return {
            status: 201,
            msg: 'Conversation created successfully',
            data: newConversation
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Create conversation error:', error);
        return {
            status: 500,
            msg: 'Failed to create conversation',
            data: null
        };
    }
};

/**
 * Find a direct conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Object|null} - Conversation object or null
 */
const findDirectConversation = async (userId1, userId2) => {
    try {
        // Find conversations where both users are participants and it's not a group chat
        const userParticipations = await ConversationParticipant.findAll({
            where: {
                userId: {
                    [Op.in]: [userId1, userId2]
                }
            },
            attributes: ['conversationId'],
            include: [{
                model: Conversation,
                where: {
                    isGroupChat: false
                }
            }]
        });

        // Group by conversationId
        const conversationCounts = {};
        userParticipations.forEach(participation => {
            const convoId = participation.conversationId;
            conversationCounts[convoId] = (conversationCounts[convoId] || 0) + 1;
        });

        // Find the conversation where both users are participants
        const directConversationId = Object.keys(conversationCounts).find(
            id => conversationCounts[id] === 2
        );

        if (!directConversationId) return null;

        return await Conversation.findByPk(directConversationId);
    } catch (error) {
        console.error('Find direct conversation error:', error);
        return null;
    }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - User ID of the sender
 * @param {string} content - Message content
 * @returns {Object} - Response with status, message, and data
 */
export const sendMessage = async (conversationId, senderId, content) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Validate input
        if (!conversationId || !senderId || !content) {
            return {
                status: 400,
                msg: 'Conversation ID, sender ID, and content are required',
                data: null
            };
        }

        // Check if conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }

        // Check if user is a participant
        const isParticipant = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId: senderId
            }
        });

        if (!isParticipant) {
            return {
                status: 403,
                msg: 'User is not a participant in this conversation',
                data: null
            };
        }

        // Create message
        const message = await Message.create({
            conversationId,
            senderId,
            content,
            readBy: [senderId] // Mark as read by sender
        }, { transaction });

        // Update conversation's lastMessageAt
        await conversation.update({
            lastMessageAt: new Date()
        }, { transaction });

        await transaction.commit();

        return {
            status: 201,
            msg: 'Message sent successfully',
            data: message
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Send message error:', error);
        return {
            status: 500,
            msg: 'Failed to send message',
            data: null
        };
    }
};

/**
 * Get messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID requesting the messages
 * @param {number} page - Page number
 * @param {number} limit - Number of messages per page
 * @returns {Object} - Response with status, message, and data
 */
export const getMessages = async (conversationId, userId, page = 1, limit = 20) => {
    try {
        // Validate input
        if (!conversationId || !userId) {
            return {
                status: 400,
                msg: 'Conversation ID and user ID are required',
                data: null
            };
        }

        // Check if conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }

        // Check if user is a participant
        const isParticipant = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId
            }
        });

        if (!isParticipant) {
            return {
                status: 403,
                msg: 'User is not a participant in this conversation',
                data: null
            };
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get messages
        const { count, rows: messages } = await Message.findAndCountAll({
            where: { conversationId },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // Mark messages as read
        for (const message of messages) {
            if (!message.readBy.includes(userId)) {
                message.readBy = [...message.readBy, userId];
                await message.save();
            }
        }

        // Update participant's last read message
        if (messages.length > 0) {
            const latestMessage = messages[0];
            await isParticipant.update({
                lastReadMessageId: latestMessage.id
            });
        }

        return {
            status: 200,
            msg: 'Messages retrieved successfully',
            data: {
                messages,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get messages error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve messages',
            data: null
        };
    }
};

/**
 * Get conversations for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Number of conversations per page
 * @returns {Object} - Response with status, message, and data
 */
export const getConversations = async (userId, page = 1, limit = 10) => {
    try {
        // Validate input
        if (!userId) {
            return {
                status: 400,
                msg: 'User ID is required',
                data: null
            };
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get conversation IDs where user is a participant
        const participations = await ConversationParticipant.findAll({
            where: { userId },
            attributes: ['conversationId']
        });

        const conversationIds = participations.map(p => p.conversationId);

        if (conversationIds.length === 0) {
            return {
                status: 200,
                msg: 'No conversations found',
                data: {
                    conversations: [],
                    pagination: {
                        total: 0,
                        page,
                        pages: 0
                    }
                }
            };
        }

        // Get conversations with latest message and participants
        const { count, rows: conversations } = await Conversation.findAndCountAll({
            where: {
                id: {
                    [Op.in]: conversationIds
                }
            },
            include: [
                {
                    model: Message,
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    include: [{
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username']
                    }]
                },
                {
                    model: ConversationParticipant,
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }]
                }
            ],
            order: [['lastMessageAt', 'DESC']],
            limit,
            offset
        });

        // Format conversations for better readability
        const formattedConversations = conversations.map(conversation => {
            const convoData = conversation.toJSON();
            
            // Extract participants
            const participants = convoData.ConversationParticipants.map(cp => ({
                id: cp.User.id,
                username: cp.User.username,
                isAdmin: cp.isAdmin
            }));
            
            // Get latest message
            const latestMessage = convoData.Messages.length > 0 ? {
                id: convoData.Messages[0].id,
                content: convoData.Messages[0].content,
                createdAt: convoData.Messages[0].createdAt,
                sender: {
                    id: convoData.Messages[0].sender.id,
                    username: convoData.Messages[0].sender.username
                }
            } : null;
            
            return {
                id: convoData.id,
                name: convoData.name,
                isGroupChat: convoData.isGroupChat,
                lastMessageAt: convoData.lastMessageAt,
                createdAt: convoData.createdAt,
                participants,
                latestMessage
            };
        });

        return {
            status: 200,
            msg: 'Conversations retrieved successfully',
            data: {
                conversations: formattedConversations,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get conversations error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve conversations',
            data: null
        };
    }
};

/**
 * Add participant to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID making the request (must be admin)
 * @param {string} participantId - User ID to add
 * @returns {Object} - Response with status, message, and data
 */
export const addParticipant = async (conversationId, userId, participantId) => {
    try {
        // Validate input
        if (!conversationId || !userId || !participantId) {
            return {
                status: 400,
                msg: 'Conversation ID, user ID, and participant ID are required',
                data: null
            };
        }

        // Check if conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }

        // Check if conversation is a group chat
        if (!conversation.isGroupChat) {
            return {
                status: 400,
                msg: 'Cannot add participants to direct conversations',
                data: null
            };
        }

        // Check if user is an admin in the conversation
        const userParticipation = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId,
                isAdmin: true
            }
        });

        if (!userParticipation) {
            return {
                status: 403,
                msg: 'Only admins can add participants',
                data: null
            };
        }

        // Check if participant is already in the conversation
        const existingParticipant = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId: participantId
            }
        });

        if (existingParticipant) {
            return {
                status: 400,
                msg: 'User is already a participant',
                data: null
            };
        }

        // Add participant
        const newParticipant = await ConversationParticipant.create({
            conversationId,
            userId: participantId,
            isAdmin: false
        });

        return {
            status: 201,
            msg: 'Participant added successfully',
            data: newParticipant
        };
    } catch (error) {
        console.error('Add participant error:', error);
        return {
            status: 500,
            msg: 'Failed to add participant',
            data: null
        };
    }
};

/**
 * Remove participant from a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID making the request (must be admin)
 * @param {string} participantId - User ID to remove
 * @returns {Object} - Response with status, message, and data
 */
export const removeParticipant = async (conversationId, userId, participantId) => {
    try {
        // Validate input
        if (!conversationId || !userId || !participantId) {
            return {
                status: 400,
                msg: 'Conversation ID, user ID, and participant ID are required',
                data: null
            };
        }

        // Check if conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }

        // Check if conversation is a group chat
        if (!conversation.isGroupChat) {
            return {
                status: 400,
                msg: 'Cannot remove participants from direct conversations',
                data: null
            };
        }

        // Users can remove themselves, or admins can remove others
        if (userId !== participantId) {
            // Check if user is an admin
            const userParticipation = await ConversationParticipant.findOne({
                where: {
                    conversationId,
                    userId,
                    isAdmin: true
                }
            });

            if (!userParticipation) {
                return {
                    status: 403,
                    msg: 'Only admins can remove other participants',
                    data: null
                };
            }
        }

        // Check if participant exists in the conversation
        const participantToRemove = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId: participantId
            }
        });

        if (!participantToRemove) {
            return {
                status: 404,
                msg: 'Participant not found in conversation',
                data: null
            };
        }

        // Remove participant
        await participantToRemove.destroy();

        return {
            status: 200,
            msg: 'Participant removed successfully',
            data: null
        };
    } catch (error) {
        console.error('Remove participant error:', error);
        return {
            status: 500,
            msg: 'Failed to remove participant',
            data: null
        };
    }
};

/**
 * Leave a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID who wants to leave
 * @returns {Object} - Response with status, message, and data
 */
export const leaveConversation = async (conversationId, userId) => {
    return removeParticipant(conversationId, userId, userId);
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID making the request (must be admin)
 * @returns {Object} - Response with status, message, and data
 */
export const deleteConversation = async (conversationId, userId) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Validate input
        if (!conversationId || !userId) {
            return {
                status: 400,
                msg: 'Conversation ID and user ID are required',
                data: null
            };
        }

        // Check if conversation exists
        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }

        // Check if user is an admin in the conversation
        const userParticipation = await ConversationParticipant.findOne({
            where: {
                conversationId,
                userId,
                isAdmin: true
            }
        });

        if (!userParticipation) {
            return {
                status: 403,
                msg: 'Only admins can delete conversations',
                data: null
            };
        }

        // Delete all messages
        await Message.destroy({
            where: { conversationId },
            transaction
        });

        // Delete all participants
        await ConversationParticipant.destroy({
            where: { conversationId },
            transaction
        });

        // Delete the conversation
        await conversation.destroy({ transaction });

        await transaction.commit();

        return {
            status: 200,
            msg: 'Conversation deleted successfully',
            data: null
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Delete conversation error:', error);
        return {
            status: 500,
            msg: 'Failed to delete conversation',
            data: null
        };
    }
};