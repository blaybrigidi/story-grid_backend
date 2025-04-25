/** @format */
import { getFriendsFeed, getDiscoverFeed } from '../services/feedService.js';

/**
 * Controller for retrieving friends feed (stories from friends and own stories)
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getFeed = async (req) => {
    try {
        const { page, limit, sortBy, sortOrder } = req.body.data || req.body || {};
        const userId = req.user.id;

        const result = await getFriendsFeed(
            userId,
            parseInt(page) || 1,
            parseInt(limit) || 10,
            sortBy || 'createdAt',
            sortOrder || 'DESC'
        );

        return {
            status: result.status || 200,
            msg: result.msg || "Feed retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get feed error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null,
            error: {
                code: error.code || 'FEED_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};

/**
 * Controller for retrieving discover feed (trending stories from all users)
 * @param {Object} req - Express request object
 * @returns {Object} - Response object with status, message, and data
 */
export const getDiscover = async (req) => {
    try {
        const { page, limit } = req.body.data || req.body || {};
        const userId = req.user.id;

        const result = await getDiscoverFeed(
            userId,
            parseInt(page) || 1,
            parseInt(limit) || 10
        );

        return {
            status: result.status || 200,
            msg: result.msg || "Discover feed retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error("Get discover feed error:", error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null,
            error: {
                code: error.code || 'DISCOVER_FEED_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
}; 