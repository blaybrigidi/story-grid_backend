/** @format */
import { createStory as createStoryService } from '../services/storyService.js';

/**
 * Controller for story creation
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const createStory = async (req, res) => {
    try {
        const { content, media } = req.body;
        const userId = req.user.id;

        if (!content && !media) {
            return {
                status: 400,
                msg: "Content and Media are required",
                data: null
            };
        }
        const story = await createStoryService({ content, media }, userId);
        return {
            status: 200,
            msg: "Story created successfully",
            data: story
        };
    }
    catch (error) {
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

