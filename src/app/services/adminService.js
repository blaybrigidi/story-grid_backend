// This is a mock implementation. In a real application, 
// you would interact with a database here

// Import the User model
import User from '../models/User.js';
import Story from '../models/Story.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ConversationParticipant from '../models/ConversationParticipant.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Media from '../models/Media.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Create admin login token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateAdminToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'admin-secret-key',
        { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '7d' }
    );
};

/**
 * Admin login function
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Object} - Response with status, message, and data
 */
export const adminLogin = async (email, password) => {
    try {
        console.log(`Attempting admin login for email: ${email}`);
        
        // Find user with admin role
        const admin = await User.findOne({
            where: { email }
        });
        
        // Check if admin exists
        if (!admin) {
            console.log(`Admin login failed: No user found with email ${email}`);
            return {
                status: 401,
                msg: 'Invalid credentials or not authorized as admin',
                data: null
            };
        }
        
        console.log(`Found user with email ${email}, checking role...`);
        
        // Check if user has admin role
        if (admin.role !== 'admin') {
            console.log(`Admin login failed: User ${email} does not have admin role. Current role: ${admin.role}`);
            return {
                status: 403,
                msg: 'Not authorized as admin',
                data: null
            };
        }
        
        // Check if account is blocked
        if (admin.isBlocked) {
            console.log(`Admin login failed: User ${email} is blocked`);
            return {
                status: 403,
                msg: 'Account is blocked. Please contact super admin.',
                data: null
            };
        }
        
        // Verify password
        try {
            console.log(`Verifying password for admin: ${email}`);
            const isValidPassword = await bcrypt.compare(password, admin.password);
            console.log(`Password verification result: ${isValidPassword}`);
            
            if (!isValidPassword) {
                console.log(`Admin login failed: Invalid password for ${email}`);
                return {
                    status: 401,
                    msg: 'Invalid credentials',
                    data: null
                };
            }
        } catch (passwordError) {
            console.error(`Password verification error for ${email}:`, passwordError);
            return {
                status: 500,
                msg: 'Error verifying password',
                data: null
            };
        }
        
        // Generate admin token
        console.log(`Generating token for admin: ${email}`);
        const token = generateAdminToken(admin);
        
        console.log(`Admin login successful for ${email}`);
        return {
            status: 200,
            msg: 'Admin login successful',
            data: {
                token,
                user: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role
                }
            }
        };
    } catch (error) {
        console.error('Admin login error:', error);
        return {
            status: 500,
            msg: `Login failed: ${error.message}`,
            data: null
        };
    }
};

/**
 * Create an admin user
 * @param {Object} userData - User data including email, password, username, etc.
 * @param {string} creatorId - ID of the user creating the admin (should be a super admin)
 * @returns {Object} - Response with status, message, and data
 */
export const createAdmin = async (userData, creatorId = null) => {
    try {
        console.log('Creating admin account with data:', JSON.stringify({
            ...userData,
            password: '***REDACTED***'
        }));
        
        const { email, password, username, firstName, lastName } = userData;
        
        if (!email || !password || !username) {
            console.log('Admin creation failed: Missing required fields');
            return {
                status: 400,
                msg: 'Email, password, and username are required',
                data: null
            };
        }
        
        // Check if user already exists with this email
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            console.log(`Admin creation failed: Email ${email} already exists`);
            return {
                status: 400,
                msg: 'User with this email already exists',
                data: null
            };
        }
        
        // Check if username is taken
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            console.log(`Admin creation failed: Username ${username} already taken`);
            return {
                status: 400,
                msg: 'Username is already taken',
                data: null
            };
        }
        
        // Use the User model hooks to hash the password
        console.log('Creating admin user in database...');
        const admin = await User.create({
            username,
            email,
            password, // The User model's beforeCreate hook will hash this
            firstName: firstName || '',
            lastName: lastName || '',
            role: 'admin',
            isEmailVerified: true // Admins are verified by default
        });
        
        console.log(`Admin account created with ID: ${admin.id}`);
        console.log(`Admin username: ${admin.username}`);
        console.log(`Admin email: ${admin.email}`);
        console.log(`Admin role: ${admin.role}`);
        
        // Generate token for the new admin
        const token = generateAdminToken(admin);
        
        return {
            status: 201,
            msg: 'Admin account created successfully',
            data: {
                user: {
                    id: admin.id,
                    email: admin.email,
                    username: admin.username,
                    firstName: admin.firstName || '',
                    lastName: admin.lastName || '',
                    role: admin.role
                },
                token
            }
        };
    } catch (error) {
        console.error('Create admin error:', error);
        return {
            status: 500,
            msg: `Failed to create admin account: ${error.message}`,
            data: null
        };
    }
};

// The old login functions can be kept as deprecated for backward compatibility
export const requestLogin = async (email, password) => {
    console.warn('Deprecated: Using requestLogin. Use adminLogin instead.');
    return adminLogin(email, password);
};

export const verifyLogin = async (email, otp) => {
    console.warn('Deprecated: Using verifyLogin. This function is no longer used.');
    return {
        status: 410,
        msg: 'OTP verification is no longer required for admin login',
        data: null
    };
};

/**
 * Block a user by their ID
 * @param {string} userId - ID of the user to block
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const blockUser = async (userId, adminId) => {
    try {
        // Find the user
        const user = await User.findByPk(userId);
        
        // Check if user exists
        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }
        
        // Check if user is already blocked
        if (user.isBlocked) {
            return {
                status: 400,
                msg: 'User is already blocked',
                data: null
            };
        }
        
        // Check if trying to block an admin (optional protection)
        if (user.role === 'admin') {
            return {
                status: 403,
                msg: 'Cannot block an admin user',
                data: null
            };
        }
        
        // Update user status to blocked
        await user.update({ isBlocked: true });
        
        // Log the action
        console.log(`Admin ${adminId} blocked user ${userId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'User has been blocked successfully',
            data: {
                userId: user.id,
                username: user.username,
                email: user.email,
                isBlocked: user.isBlocked
            }
        };
    } catch (error) {
        console.error('Block user error:', error);
        return {
            status: 500,
            msg: 'Failed to block user',
            data: null
        };
    }
};

/**
 * Unblock a user by their ID
 * @param {string} userId - ID of the user to unblock
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const unblockUser = async (userId, adminId) => {
    try {
        // Find the user
        const user = await User.findByPk(userId);
        
        // Check if user exists
        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }
        
        // Check if user is already unblocked
        if (!user.isBlocked) {
            return {
                status: 400,
                msg: 'User is not blocked',
                data: null
            };
        }
        
        // Update user status to unblocked
        await user.update({ isBlocked: false });
        
        // Log the action
        console.log(`Admin ${adminId} unblocked user ${userId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'User has been unblocked successfully',
            data: {
                userId: user.id,
                username: user.username,
                email: user.email,
                isBlocked: user.isBlocked
            }
        };
    } catch (error) {
        console.error('Unblock user error:', error);
        return {
            status: 500,
            msg: 'Failed to unblock user',
            data: null
        };
    }
};

/**
 * Delete a user and all associated data
 * @param {string} userId - ID of the user to delete
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const deleteUser = async (userId, adminId) => {
    // Use a transaction to ensure all operations are performed atomically
    const transaction = await sequelize.transaction();
    
    try {
        // Find the user
        const user = await User.findByPk(userId);
        
        // Check if user exists
        if (!user) {
            return {
                status: 404,
                msg: 'User not found',
                data: null
            };
        }
        
        // Check if trying to delete an admin (optional protection)
        if (user.role === 'admin') {
            return {
                status: 403,
                msg: 'Cannot delete an admin user',
                data: null
            };
        }
        
        // Store user info for response before deleting
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        // Delete all likes by this user
        await Like.destroy({
            where: { userId },
            transaction
        });
        
        // Delete all comments by this user
        await Comment.destroy({
            where: { userId },
            transaction
        });
        
        // Find all stories by this user
        const userStories = await Story.findAll({
            where: { userId },
            transaction
        });
        
        // Delete all media associated with user's stories
        for (const story of userStories) {
            await Media.destroy({
                where: { storyId: story.id },
                transaction
            });
        }
        
        // Delete all stories by this user
        await Story.destroy({
            where: { userId },
            transaction
        });
        
        // Remove user from all conversations
        await ConversationParticipant.destroy({
            where: { userId },
            transaction
        });
        
        // Finally, delete the user
        await User.destroy({
            where: { id: userId },
            transaction
        });
        
        // Commit the transaction
        await transaction.commit();
        
        // Log the action
        console.log(`Admin ${adminId} deleted user ${userId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'User has been deleted successfully',
            data: userInfo
        };
    } catch (error) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error('Delete user error:', error);
        return {
            status: 500,
            msg: 'Failed to delete user',
            data: null
        };
    }
};

/**
 * Delete a story and all associated data
 * @param {string} storyId - ID of the story to delete
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const deleteStory = async (storyId, adminId) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Find the story
        const story = await Story.findByPk(storyId);
        
        // Check if story exists
        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }
        
        // Store story info for response before deleting
        const storyInfo = {
            id: story.id,
            title: story.title,
            userId: story.userId
        };
        
        // Delete all likes associated with this story
        await Like.destroy({
            where: { storyId },
            transaction
        });
        
        // Delete all comments on this story
        await Comment.destroy({
            where: { storyId },
            transaction
        });
        
        // Delete all media associated with this story
        await Media.destroy({
            where: { storyId },
            transaction
        });
        
        // Finally, delete the story
        await Story.destroy({
            where: { id: storyId },
            transaction
        });
        
        // Commit the transaction
        await transaction.commit();
        
        // Log the action
        console.log(`Admin ${adminId} deleted story ${storyId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'Story has been deleted successfully',
            data: storyInfo
        };
    } catch (error) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error('Delete story error:', error);
        return {
            status: 500,
            msg: 'Failed to delete story',
            data: null
        };
    }
};

/**
 * Delete a message
 * @param {string} messageId - ID of the message to delete
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const deleteMessage = async (messageId, adminId) => {
    try {
        // Find the message
        const message = await Message.findByPk(messageId);
        
        // Check if message exists
        if (!message) {
            return {
                status: 404,
                msg: 'Message not found',
                data: null
            };
        }
        
        // Store message info for response before deleting
        const messageInfo = {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId
        };
        
        // Delete the message
        await message.destroy();
        
        // Log the action
        console.log(`Admin ${adminId} deleted message ${messageId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'Message has been deleted successfully',
            data: messageInfo
        };
    } catch (error) {
        console.error('Delete message error:', error);
        return {
            status: 500,
            msg: 'Failed to delete message',
            data: null
        };
    }
};

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - ID of the conversation to delete
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const deleteConversation = async (conversationId, adminId) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Find the conversation
        const conversation = await Conversation.findByPk(conversationId);
        
        // Check if conversation exists
        if (!conversation) {
            return {
                status: 404,
                msg: 'Conversation not found',
                data: null
            };
        }
        
        // Store conversation info for response before deleting
        const conversationInfo = {
            id: conversation.id,
            name: conversation.name,
            isGroupChat: conversation.isGroupChat
        };
        
        // Delete all messages in the conversation
        await Message.destroy({
            where: { conversationId },
            transaction
        });
        
        // Delete all participants in the conversation
        await ConversationParticipant.destroy({
            where: { conversationId },
            transaction
        });
        
        // Finally, delete the conversation
        await conversation.destroy({ transaction });
        
        // Commit the transaction
        await transaction.commit();
        
        // Log the action
        console.log(`Admin ${adminId} deleted conversation ${conversationId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'Conversation has been deleted successfully',
            data: conversationInfo
        };
    } catch (error) {
        // Rollback the transaction in case of error
        await transaction.rollback();
        console.error('Delete conversation error:', error);
        return {
            status: 500,
            msg: 'Failed to delete conversation',
            data: null
        };
    }
};

/**
 * Delete a comment
 * @param {string} commentId - ID of the comment to delete
 * @param {string} adminId - ID of the admin performing the action
 * @returns {Object} - Response with status, message, and data
 */
export const deleteComment = async (commentId, adminId) => {
    try {
        // Find the comment
        const comment = await Comment.findByPk(commentId);
        
        // Check if comment exists
        if (!comment) {
            return {
                status: 404,
                msg: 'Comment not found',
                data: null
            };
        }
        
        // Store comment info for response before deleting
        const commentInfo = {
            id: comment.id,
            storyId: comment.storyId,
            userId: comment.userId
        };
        
        // Delete the comment
        await comment.destroy();
        
        // Log the action
        console.log(`Admin ${adminId} deleted comment ${commentId} at ${new Date().toISOString()}`);
        
        return {
            status: 200,
            msg: 'Comment has been deleted successfully',
            data: commentInfo
        };
    } catch (error) {
        console.error('Delete comment error:', error);
        return {
            status: 500,
            msg: 'Failed to delete comment',
            data: null
        };
    }
}; 