/** @format */
import { Op } from 'sequelize';
import Story from '../models/Story.js';
import User from '../models/User.js';
import Media from '../models/Media.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Friend from '../models/Friend.js';
import sequelize from '../config/database.js';

/**
 * Get feed stories from user's friends and own stories
 * @param {string} userId - ID of the user requesting the feed
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of stories per page
 * @param {string} sortBy - Field to sort by (createdAt, likesCount)
 * @param {string} sortOrder - Sort order (ASC or DESC)
 * @returns {Object} - Response with status, message, and data
 */
export const getFriendsFeed = async (userId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC') => {
    try {
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Get list of friend IDs (users who the current user is following)
        const friendships = await Friend.findAll({
            where: { followerId: userId, status: 'approved' }
        });
        
        // Extract friend IDs from friendships
        const friendIds = friendships.map(friendship => friendship.followingId);
        
        // Add user's own ID to see their own stories too
        const userIds = [...friendIds, userId];
        
        // Define the order based on sortBy and sortOrder
        let order = [];
        
        if (sortBy === 'likesCount') {
            // When sorting by likes, we need to use a subquery
            order = [[sequelize.literal('(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."storyId" = "Story"."id")'), sortOrder]];
        } else {
            // Default sorting by createdAt
            order = [['createdAt', sortOrder]];
        }
        
        // Get stories from friends and own stories
        const { count, rows: stories } = await Story.findAndCountAll({
            where: {
                userId: { [Op.in]: userIds },
                status: 'published'  // Only get published stories
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Media,
                    as: 'media',
                    attributes: ['id', 'type', 'url', 'order'],
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['userId']
                },
                {
                    model: Comment,
                    as: 'comments',
                    attributes: ['id'],
                    limit: 0,  // We only need the count
                    separate: true // Use a separate query for performance
                }
            ],
            order,
            limit,
            offset,
            distinct: true
        });
        
        // Add additional data to each story
        const storiesWithMetadata = stories.map(story => {
            const storyObj = story.toJSON();
            
            // Add like count
            storyObj.likeCount = story.likes.length;
            
            // Add comment count
            storyObj.commentCount = story.comments.length;
            
            // Add whether the current user has liked the story
            storyObj.userLiked = story.likes.some(like => like.userId === userId);
            
            // Calculate time ago for display
            const createdAt = new Date(story.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 1) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours < 1) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    storyObj.timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                } else {
                    storyObj.timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                }
            } else if (diffDays < 7) {
                storyObj.timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                storyObj.timeAgo = createdAt.toLocaleDateString();
            }
            
            return storyObj;
        });
        
        return {
            status: 200,
            msg: 'Feed retrieved successfully',
            data: {
                stories: storiesWithMetadata,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get feed error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve feed',
            data: null,
            error: {
                code: error.code || 'FEED_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * Get trending stories for the discover feed
 * @param {string} userId - ID of the user requesting the feed
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of stories per page
 * @returns {Object} - Response with status, message, and data
 */
export const getDiscoverFeed = async (userId, page = 1, limit = 10) => {
    try {
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Get trending stories (most likes and comments in the last week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count, rows: stories } = await Story.findAndCountAll({
            where: {
                status: 'published',
                createdAt: { [Op.gte]: oneWeekAgo }
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Media,
                    as: 'media',
                    attributes: ['id', 'type', 'url', 'order']
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['userId']
                },
                {
                    model: Comment,
                    as: 'comments',
                    attributes: ['id'],
                    limit: 0,
                    separate: true
                }
            ],
            // Order by a combination of likes count and comments count
            order: [[sequelize.literal('(SELECT COUNT(*) FROM "Likes" WHERE "Likes"."storyId" = "Story"."id") + (SELECT COUNT(*) FROM "Comments" WHERE "Comments"."storyId" = "Story"."id")'), 'DESC']],
            limit,
            offset,
            distinct: true
        });
        
        // Add additional data to each story
        const storiesWithMetadata = stories.map(story => {
            const storyObj = story.toJSON();
            
            // Add engagement metrics
            storyObj.likeCount = story.likes.length;
            storyObj.commentCount = story.comments.length;
            
            // Add whether the current user has liked the story
            storyObj.userLiked = story.likes.some(like => like.userId === userId);
            
            // Calculate time ago for display
            const createdAt = new Date(story.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 1) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours < 1) {
                    const diffMinutes = Math.floor(diffTime / (1000 * 60));
                    storyObj.timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                } else {
                    storyObj.timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                }
            } else if (diffDays < 7) {
                storyObj.timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            } else {
                storyObj.timeAgo = createdAt.toLocaleDateString();
            }
            
            return storyObj;
        });
        
        return {
            status: 200,
            msg: 'Discover feed retrieved successfully',
            data: {
                stories: storiesWithMetadata,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get discover feed error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve discover feed',
            data: null,
            error: {
                code: error.code || 'DISCOVER_FEED_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
}; 