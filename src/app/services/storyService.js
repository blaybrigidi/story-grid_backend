/** @format */
import { Op } from 'sequelize';
import Story from '../models/Story.js';
import User from '../models/User.js';
import Media from '../models/Media.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';

export const createStory = async (storyData, userId) => {
    try {
        const story = await Story.create({
            ...storyData,
            userId,
            status: 'draft'
        });

        return {
            status: 201,
            msg: 'Story created successfully',
            data: story
        };
    } catch (error) {
        console.error('Create story error:', error);
        return {
            status: 500,
            msg: 'Failed to create story',
            data: null
        };
    }
};

export const getStory = async (storyId, userId) => {
    try {
        const story = await Story.findOne({
            where: { id: storyId },
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
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    }]
                },
                {
                    model: Like,
                    as: 'likes',
                    attributes: ['userId']
                }
            ]
        });

        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }

        // Add user's like status
        const userLiked = story.likes.some(like => like.userId === userId);
        story.setDataValue('userLiked', userLiked);

        return {
            status: 200,
            msg: 'Story retrieved successfully',
            data: story
        };
    } catch (error) {
        console.error('Get story error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve story',
            data: null
        };
    }
};

export const updateStory = async (storyId, userId, updateData) => {
    try {
        const story = await Story.findOne({
            where: { id: storyId, userId }
        });

        if (!story) {
            return {
                status: 404,
                msg: 'Story not found or unauthorized',
                data: null
            };
        }

        await story.update(updateData);

        return {
            status: 200,
            msg: 'Story updated successfully',
            data: story
        };
    } catch (error) {
        console.error('Update story error:', error);
        return {
            status: 500,
            msg: 'Failed to update story',
            data: null
        };
    }
};

export const deleteStory = async (storyId, userId) => {
    try {
        const story = await Story.findOne({
            where: { id: storyId, userId }
        });

        if (!story) {
            return {
                status: 404,
                msg: 'Story not found or unauthorized',
                data: null
            };
        }

        await story.destroy();

        return {
            status: 200,
            msg: 'Story deleted successfully',
            data: null
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

export const getStories = async (filters = {}, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        const where = {};

        // Apply filters
        if (filters.userId) where.userId = filters.userId;
        if (filters.status) where.status = filters.status;
        if (filters.category) where.category = filters.category;
        if (filters.search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${filters.search}%` } },
                { content: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        const { count, rows } = await Story.findAndCountAll({
            where,
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
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            status: 200,
            msg: 'Stories retrieved successfully',
            data: {
                stories: rows,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get stories error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve stories',
            data: null
        };
    }
};

export const getTrendingStories = async (limit = 10) => {
    try {
        const stories = await Story.findAll({
            where: { status: 'published' },
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
                    attributes: ['id']
                }
            ],
            order: [
                ['viewCount', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit
        });

        // Calculate engagement score
        const storiesWithScore = stories.map(story => {
            const engagementScore = 
                (story.likes.length * 2) + // Likes count double
                story.comments.length + // Comments count
                story.viewCount; // Views count
            
            story.setDataValue('engagementScore', engagementScore);
            return story;
        });

        // Sort by engagement score
        storiesWithScore.sort((a, b) => b.engagementScore - a.engagementScore);

        return {
            status: 200,
            msg: 'Trending stories retrieved successfully',
            data: storiesWithScore
        };
    } catch (error) {
        console.error('Get trending stories error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve trending stories',
            data: null
        };
    }
};

/**
 * Like a story
 * @param {string} storyId - ID of the story to like
 * @param {string} userId - ID of the user liking the story
 * @returns {Object} - Response with status, message, and data
 */
export const likeStory = async (storyId, userId) => {
    try {
        // Check if story exists
        const story = await Story.findByPk(storyId);
        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }

        // Check if user already liked the story
        const existingLike = await Like.findOne({
            where: { storyId, userId }
        });

        if (existingLike) {
            return {
                status: 400,
                msg: 'You already liked this story',
                data: null
            };
        }

        // Create new like
        const like = await Like.create({
            storyId,
            userId
        });

        // Get updated like count
        const likeCount = await Like.count({
            where: { storyId }
        });

        return {
            status: 200,
            msg: 'Story liked successfully',
            data: {
                like,
                likeCount
            }
        };
    } catch (error) {
        console.error('Like story error:', error);
        return {
            status: 500,
            msg: 'Failed to like story',
            data: null
        };
    }
};

/**
 * Unlike a story
 * @param {string} storyId - ID of the story to unlike
 * @param {string} userId - ID of the user unliking the story
 * @returns {Object} - Response with status, message, and data
 */
export const unlikeStory = async (storyId, userId) => {
    try {
        // Check if story exists
        const story = await Story.findByPk(storyId);
        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }

        // Check if user has liked the story
        const existingLike = await Like.findOne({
            where: { storyId, userId }
        });

        if (!existingLike) {
            return {
                status: 400,
                msg: 'You have not liked this story',
                data: null
            };
        }

        // Delete the like
        await existingLike.destroy();

        // Get updated like count
        const likeCount = await Like.count({
            where: { storyId }
        });

        return {
            status: 200,
            msg: 'Story unliked successfully',
            data: {
                likeCount
            }
        };
    } catch (error) {
        console.error('Unlike story error:', error);
        return {
            status: 500,
            msg: 'Failed to unlike story',
            data: null
        };
    }
};

/**
 * Add a comment to a story
 * @param {string} storyId - ID of the story to comment on
 * @param {string} userId - ID of the user commenting
 * @param {string} content - Comment content
 * @param {string} parentId - Optional parent comment ID for replies
 * @returns {Object} - Response with status, message, and data
 */
export const addComment = async (storyId, userId, content, parentId = null) => {
    try {
        // Check if story exists
        const story = await Story.findByPk(storyId);
        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }

        // If there's a parent comment, verify it exists and belongs to the same story
        if (parentId) {
            const parentComment = await Comment.findOne({
                where: { id: parentId, storyId }
            });

            if (!parentComment) {
                return {
                    status: 404,
                    msg: 'Parent comment not found or does not belong to this story',
                    data: null
                };
            }
        }

        // Create the comment
        const comment = await Comment.create({
            storyId,
            userId,
            content,
            parentId
        });

        // Fetch the comment with user information
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'username']
            }]
        });

        return {
            status: 201,
            msg: 'Comment added successfully',
            data: commentWithUser
        };
    } catch (error) {
        console.error('Add comment error:', error);
        return {
            status: 500,
            msg: 'Failed to add comment',
            data: null
        };
    }
};

/**
 * Get comments for a story
 * @param {string} storyId - ID of the story to get comments for
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of comments per page
 * @returns {Object} - Response with status, message, and data
 */
export const getComments = async (storyId, page = 1, limit = 10) => {
    try {
        // Check if story exists
        const story = await Story.findByPk(storyId);
        if (!story) {
            return {
                status: 404,
                msg: 'Story not found',
                data: null
            };
        }

        const offset = (page - 1) * limit;

        // Get root comments (no parent)
        const { count, rows: rootComments } = await Comment.findAndCountAll({
            where: { 
                storyId,
                parentId: null
            },
            include: [{
                model: User,
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // For each root comment, fetch replies
        const commentsWithReplies = await Promise.all(
            rootComments.map(async (comment) => {
                const replies = await Comment.findAll({
                    where: { parentId: comment.id },
                    include: [{
                        model: User,
                        attributes: ['id', 'username']
                    }],
                    order: [['createdAt', 'ASC']],
                    limit: 5 // Limit replies to 5 per comment
                });
                
                const result = comment.toJSON();
                result.replies = replies;
                result.replyCount = await Comment.count({
                    where: { parentId: comment.id }
                });
                
                return result;
            })
        );

        return {
            status: 200,
            msg: 'Comments retrieved successfully',
            data: {
                comments: commentsWithReplies,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        };
    } catch (error) {
        console.error('Get comments error:', error);
        return {
            status: 500,
            msg: 'Failed to retrieve comments',
            data: null
        };
    }
};

/**
 * Delete a comment
 * @param {string} commentId - ID of the comment to delete
 * @param {string} userId - ID of the user deleting the comment
 * @returns {Object} - Response with status, message, and data
 */
export const deleteComment = async (commentId, userId) => {
    try {
        const comment = await Comment.findByPk(commentId);
        
        if (!comment) {
            return {
                status: 404,
                msg: 'Comment not found',
                data: null
            };
        }
        
        // Check if user is the comment author
        if (comment.userId !== userId) {
            // Check if user is the story owner
            const story = await Story.findByPk(comment.storyId);
            if (!story || story.userId !== userId) {
                return {
                    status: 403,
                    msg: 'You are not authorized to delete this comment',
                    data: null
                };
            }
        }
        
        // Delete all replies to this comment
        await Comment.destroy({
            where: { parentId: commentId }
        });
        
        // Delete the comment itself
        await comment.destroy();
        
        return {
            status: 200,
            msg: 'Comment deleted successfully',
            data: null
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
