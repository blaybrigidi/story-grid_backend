/** @format */
import { createStory as createStoryService, getStory as getStoryService, deleteStory as deleteStoryService, likeStory as likeStoryService, unlikeStory as unlikeStoryService, addComment as addCommentService, getComments as getCommentsService, deleteComment as deleteCommentService, getUserDashboardStories as getUserDashboardStoriesService, getRecentStories as getRecentStoriesService } from '../services/storyService.js';
import Media from '../models/Media.js';

/**
 * Controller for story creation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const createStory = async (req) => {
    try {
        const { title, content, category, tags, media } = req.body.data || req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title) {
            return {
                status: 400,
                msg: "Title is required",
                data: null
            };
        }

        if (!content) {
            return {
                status: 400,
                msg: "Content is required",
                data: null
            };
        }

        // Create story data object
        const storyData = {
            title,
            content,
            userId,
            status: 'draft',
            category: category || null,
            tags: tags || []
        };

        // Call service to create story
        const result = await createStoryService(storyData, userId);
        
        // Add media if provided
        if (media && Array.isArray(media) && media.length > 0) {
            try {
                // Use the story ID from the created story
                const storyId = result.data.id;
                
                // Process each media item
                const mediaPromises = media.map(async (mediaItem, index) => {
                    if (!mediaItem.url || !mediaItem.type) {
                        console.error('Invalid media item:', mediaItem);
                        return null;
                    }
                    
                    // Create a Media record
                    const mediaRecord = await Media.create({
                        storyId,
                        type: mediaItem.type,
                        url: mediaItem.url,
                        order: index,
                        metadata: mediaItem.metadata || {}
                    });
                    
                    return mediaRecord;
                });
                
                // Wait for all media records to be created
                const mediaRecords = await Promise.all(mediaPromises);
                
                // Filter out any null values from failed media creation
                const validMediaRecords = mediaRecords.filter(record => record !== null);
                
                // Add media to the result
                result.data.media = validMediaRecords;
            } catch (mediaError) {
                console.error('Media creation error:', mediaError);
                // Continue without failing the whole request
                // The story is already created, we just couldn't attach some media
            }
        }

        return {
            status: result.status || 201,
            msg: result.msg || "Story created successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Create story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for getting a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getStory = async (req) => {
    try {
        const { storyId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        const result = await getStoryService(storyId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Story retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for deleting a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const deleteStory = async (req) => {
    try {
        const { storyId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        const result = await deleteStoryService(storyId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Story deleted successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Delete story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for liking a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const likeStory = async (req) => {
    try {
        const { storyId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        const result = await likeStoryService(storyId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Story liked successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Like story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for unliking a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const unlikeStory = async (req) => {
    try {
        const { storyId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        const result = await unlikeStoryService(storyId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Story unliked successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Unlike story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for adding a comment to a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const commentStory = async (req) => {
    try {
        const { storyId, content, parentId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        if (!content || content.trim() === '') {
            return {
                status: 400,
                msg: "Comment content cannot be empty",
                data: null
            };
        }

        const result = await addCommentService(storyId, userId, content, parentId);

        return {
            status: result.status || 201,
            msg: result.msg || "Comment added successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Comment story error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for retrieving comments on a story
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getComments = async (req) => {
    try {
        const { storyId, page, limit } = req.body.data || req.body;

        if (!storyId) {
            return {
                status: 400,
                msg: "Story ID is required",
                data: null
            };
        }

        const result = await getCommentsService(
            storyId,
            parseInt(page) || 1,
            parseInt(limit) || 10
        );

        return {
            status: result.status || 200,
            msg: result.msg || "Comments retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get comments error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for deleting a comment
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const deleteComment = async (req) => {
    try {
        const { commentId } = req.body.data || req.body;
        const userId = req.user.id;

        if (!commentId) {
            return {
                status: 400,
                msg: "Comment ID is required",
                data: null
            };
        }

        const result = await deleteCommentService(commentId, userId);

        return {
            status: result.status || 200,
            msg: result.msg || "Comment deleted successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Delete comment error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

/**
 * Controller for getting user's dashboard stories (recent published and drafts)
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getDashboardStories = async (req) => {
    try {
        const { limit } = req.body.data || req.body || {};
        const userId = req.user.id;

        const result = await getUserDashboardStoriesService(
            userId,
            parseInt(limit) || 3
        );

        return {
            status: result.status || 200,
            msg: result.msg || "Dashboard stories retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get dashboard stories error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null,
            error: {
                code: error.code || 'DASHBOARD_STORIES_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * Controller for getting recent stories
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getRecentStories = async (req) => {
    try {
        const { filters = {}, page = 1, limit = 10 } = req.body.data || req.body;

        const result = await getRecentStoriesService(filters, page, limit);

        return {
            status: result.status || 200,
            msg: result.msg || "Recent stories retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get recent stories error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

