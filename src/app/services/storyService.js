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
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture']
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
                        attributes: ['id', 'firstName', 'lastName', 'profilePicture']
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
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture']
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
                    attributes: ['id', 'firstName', 'lastName', 'profilePicture']
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
