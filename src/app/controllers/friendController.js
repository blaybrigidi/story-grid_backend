/** @format */
import { 
    sendFriendRequest as sendFriendRequestService, 
    acceptFriendRequest as acceptFriendRequestService, 
    getPendingRequests as getPendingRequestsService, 
    getFriends as getFriendsService, 
    rejectFriendRequest as rejectFriendRequestService, 
    removeFriend as removeFriendService 
} from '../services/friendService.js';

export const sendFriendRequest = async (req, res, next) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        const result = await sendFriendRequestService(userId, friendId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Friend request sent successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Send friend request error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

export const acceptFriendRequest = async (req, res, next) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const result = await acceptFriendRequestService(userId, friendId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Friend request accepted successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Accept friend request error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

export const getPendingRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await getPendingRequestsService(userId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Pending requests retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Get pending requests error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

export const getFriends = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await getFriendsService(userId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Friends retrieved successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Get friends error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

export const rejectFriendRequest = async (req, res, next) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const result = await rejectFriendRequestService(userId, friendId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Friend request rejected successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Reject friend request error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
};

export const removeFriend = async (req, res, next) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const result = await removeFriendService(userId, friendId);
        
        return {
            status: result.status || 200,
            msg: result.msg || "Friend removed successfully",
            data: result.data
        };
    } catch (error) {
        console.error('Remove friend error:', error);
        return {
            status: 500,
            msg: "Internal Server Error",
            data: null
        };
    }
}; 