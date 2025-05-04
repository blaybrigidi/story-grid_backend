import { 
    adminLogin,
    requestLogin as adminRequestLogin, 
    verifyLogin as adminVerifyLogin, 
    blockUser as blockUserService, 
    unblockUser as unblockUserService,
    deleteUser as deleteUserService,
    deleteStory as deleteStoryService,
    deleteMessage as deleteMessageService,
    deleteComment as deleteCommentService,
    deleteConversation as deleteConversationService,
    createAdmin as createAdminService
} from '../services/adminService.js';
import User from '../models/User.js';
import Story from '../models/Story.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import { Op } from 'sequelize';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

/**
 * Controller for admin login
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const login = async (req) => {
    const { email, password } = req.body.data || req.body;

    // Validate if email and password are provided
    if (!email || !password) {
        console.warn(`[WARN] Missing email or password in admin login request.`);
        return {
            status: 400,
            msg: "Email and password are required to log in.",
            data: null
        };
    }

    console.log(`[INFO] Admin login requested for email: ${email}`);

    try {
        // Call service function to validate credentials and return token
        const response = await adminLogin(email, password);

        if (response.status === 200) {
            console.log(`[SUCCESS] Admin login successful for email: ${email}`);
        } else {
            console.warn(`[WARN] Admin login failed for email: ${email}`);
        }

        return {
            status: response.status,
            msg: response.msg,
            data: response.data || null
        };
    } catch (error) {
        console.error(`[ERROR] Failed to process login request for email: ${email}`, error);
        return {
            status: 500,
            msg: "An error occurred while processing the login request.",
            data: null
        };
    }
};

/**
 * Controller for creating an admin user
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const createAdmin = async (req) => {
    const userData = req.body.data || req.body;
    const adminId = req.user?.id; // Optional: the ID of the admin creating this new admin

    // Validate required fields
    if (!userData.email || !userData.password || !userData.username) {
        return {
            status: 400,
            msg: "Email, password, and username are required",
            data: null
        };
    }

    try {
        const response = await createAdminService(userData, adminId);
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error("Create admin error:", error);
        return {
            status: 500,
            msg: "An error occurred while creating the admin user",
            data: null
        };
    }
};

// The old login functions can be kept for backward compatibility
export const requestLogin = async (req) => {
  console.warn(`[WARN] Deprecated: Using requestLogin. Use login instead.`);
  return login(req);
};

export const verifyLogin = async (req) => {
  console.warn(`[WARN] Deprecated: Using verifyLogin. This function is no longer used.`);
  return {
    status: 410,
    msg: "OTP verification is no longer required for admin login",
    data: null
  };
};

export const getDashboard = async (req) => {
    try {
        // Get total user count
        const totalUsers = await User.count();
        
        // Get active users (not blocked)
        const activeUsers = await User.count({
            where: { isBlocked: false }
        });
        
        // Get blocked users
        const blockedUsers = await User.count({
            where: { isBlocked: true }
        });
        
        // Get total stories
        const totalStories = await Story.count();
        
        // Get published stories
        const publishedStories = await Story.count({
            where: { status: 'published' }
        });
        
        // Get draft stories
        const draftStories = await Story.count({
            where: { status: 'draft' }
        });
        
        // Get archived stories
        const archivedStories = await Story.count({
            where: { status: 'archived' }
        });
        
        // Get total comments
        const totalComments = await Comment.count();
        
        // Get total likes
        const totalLikes = await Like.count();
        
        // Get total messages
        const totalMessages = await Message.count();
        
        // Get total conversations
        const totalConversations = await Conversation.count();
        
        // Get recent registrations (users registered in the last 7 days)
        const lastWeekDate = new Date();
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        
        const newUserCount = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: lastWeekDate
                }
            }
        });
        
        // Get new stories in the last 7 days
        const newStoryCount = await Story.count({
            where: {
                createdAt: {
                    [Op.gte]: lastWeekDate
                }
            }
        });
        
        // Get new comments in the last 7 days
        const newCommentCount = await Comment.count({
            where: {
                createdAt: {
                    [Op.gte]: lastWeekDate
                }
            }
        });
        
        // Get recent users
        const recentUsers = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        // Get recent stories with author information
        const recentStories = await Story.findAll({
            attributes: ['id', 'title', 'status', 'createdAt', 'userId'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        // Get recent comments with user and story information
        const recentComments = await Comment.findAll({
            attributes: ['id', 'content', 'createdAt', 'userId', 'storyId'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        // Get recent messages with sender information
        const recentMessages = await Message.findAll({
            attributes: ['id', 'content', 'createdAt', 'senderId', 'conversationId'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        // Get user info separately to avoid association issues
        if (recentStories.length > 0) {
            const userIds = recentStories.map(story => story.userId);
            const storyAuthors = await User.findAll({
                attributes: ['id', 'username'],
                where: { id: userIds }
            });
            
            // Map author info to stories
            recentStories.forEach(story => {
                const author = storyAuthors.find(user => user.id === story.userId);
                story.dataValues.author = author || null;
            });
        }
        
        // Get comment user info
        if (recentComments.length > 0) {
            const commentUserIds = recentComments.map(comment => comment.userId);
            const commentStoryIds = recentComments.map(comment => comment.storyId);
            
            const commentUsers = await User.findAll({
                attributes: ['id', 'username'],
                where: { id: commentUserIds }
            });
            
            const commentStories = await Story.findAll({
                attributes: ['id', 'title'],
                where: { id: commentStoryIds }
            });
            
            // Map user and story info to comments
            recentComments.forEach(comment => {
                const user = commentUsers.find(user => user.id === comment.userId);
                const story = commentStories.find(story => story.id === comment.storyId);
                
                comment.dataValues.user = user || null;
                comment.dataValues.story = story || null;
            });
        }
        
        // Get message sender info
        if (recentMessages.length > 0) {
            const messageSenderIds = recentMessages.map(message => message.senderId);
            
            const messageSenders = await User.findAll({
                attributes: ['id', 'username'],
                where: { id: messageSenderIds }
            });
            
            // Map sender info to messages
            recentMessages.forEach(message => {
                const sender = messageSenders.find(user => user.id === message.senderId);
                message.dataValues.sender = sender || null;
            });
        }
        
        // Format the dashboard data
        const dashboardData = {
            users: {
                total: totalUsers,
                active: activeUsers,
                blocked: blockedUsers,
                newLastWeek: newUserCount
            },
            stories: {
                total: totalStories,
                published: publishedStories,
                draft: draftStories,
                archived: archivedStories,
                newLastWeek: newStoryCount
            },
            engagement: {
                comments: {
                    total: totalComments,
                    newLastWeek: newCommentCount
                },
                likes: totalLikes,
                messages: totalMessages,
                conversations: totalConversations
            },
            recentActivity: {
                users: recentUsers,
                stories: recentStories,
                comments: recentComments,
                messages: recentMessages
            }
        };
        
        return {
            status: 200,
            msg: 'Dashboard data retrieved successfully',
            data: dashboardData
        };
    } catch (error) {
        console.error('Get dashboard error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve dashboard data',
            data: null
        };
    }
};

export const getAllUsers = async (req) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'lastName', 'isActive', 'isBlocked', 'createdAt']
        });
        
        return {
            status: 200,
            msg: 'Users retrieved successfully',
            data: users
        };
    } catch (error) {
        console.error('Get users error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve users',
            data: null
        };
    }
};

export const blockUser = async (req) => {
    try {
        const { userId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!userId) {
            return {
                status: 400,
                msg: 'User ID is required',
                data: null
            };
        }
        
        const response = await blockUserService(userId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
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

export const unblockUser = async (req) => {
    try {
        const { userId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!userId) {
            return {
                status: 400,
                msg: 'User ID is required',
                data: null
            };
        }
        
        const response = await unblockUserService(userId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
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

export const deleteUser = async (req) => {
    try {
        const { userId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!userId) {
            return {
                status: 400,
                msg: 'User ID is required',
                data: null
            };
        }
        
        const response = await deleteUserService(userId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error('Delete user error:', error);
        return {
            status: 500,
            msg: 'Failed to delete user',
            data: null
        };
    }
};

export const deleteStory = async (req) => {
    try {
        const { storyId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!storyId) {
            return {
                status: 400,
                msg: 'Story ID is required',
                data: null
            };
        }
        
        const response = await deleteStoryService(storyId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error('Delete story error:', error);
        return {
            status: 500,
            msg: 'Failed to delete story',
            data: null
        };
    }
};

export const deleteComment = async (req) => {
    try {
        const { commentId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!commentId) {
            return {
                status: 400,
                msg: 'Comment ID is required',
                data: null
            };
        }
        
        const response = await deleteCommentService(commentId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
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

export const deleteMessage = async (req) => {
    try {
        const { messageId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!messageId) {
            return {
                status: 400,
                msg: 'Message ID is required',
                data: null
            };
        }
        
        const response = await deleteMessageService(messageId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
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

export const deleteConversation = async (req) => {
    try {
        const { conversationId } = req.params || req.body.data || req.body;
        const adminId = req.user.id; // Get admin ID from the authenticated request
        
        if (!conversationId) {
            return {
                status: 400,
                msg: 'Conversation ID is required',
                data: null
            };
        }
        
        const response = await deleteConversationService(conversationId, adminId);
        
        return {
            status: response.status,
            msg: response.msg,
            data: response.data
        };
    } catch (error) {
        console.error('Delete conversation error:', error);
        return {
            status: 500,
            msg: 'Failed to delete conversation',
            data: null
        };
    }
}; 