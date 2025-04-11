/** @format */
import { Op } from 'sequelize';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';

class FriendService {
    /**
     * Send a friend request
     * @param {number} userId - ID of the user sending the request
     * @param {number} friendId - ID of the user to send request to
     * @returns {Promise<Object>} - Response object
     */
    async sendFriendRequest(userId, friendId) {
        try {
            // Check if users exist
            const [user, friend] = await Promise.all([
                User.findByPk(userId),
                User.findByPk(friendId)
            ]);

            if (!user || !friend) {
                return {
                    status: 404,
                    msg: 'User not found',
                    data: null
                };
            }

            // Check if friendship already exists
            const existingFriendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { userId, friendId },
                        { userId: friendId, friendId: userId }
                    ]
                }
            });

            if (existingFriendship) {
                return {
                    status: 400,
                    msg: 'Friendship already exists',
                    data: null
                };
            }

            // Create friendship request
            const friendship = await Friendship.create({
                userId,
                friendId,
                status: 'pending'
            });

            return {
                status: 201,
                msg: 'Friend request sent successfully',
                data: friendship
            };
        } catch (error) {
            console.error('Send friend request error:', error);
            return {
                status: 500,
                msg: 'Failed to send friend request',
                data: null
            };
        }
    }

    /**
     * Accept a friend request
     * @param {number} userId - ID of the user accepting the request
     * @param {number} friendId - ID of the user who sent the request
     * @returns {Promise<Object>} - Response object
     */
    async acceptFriendRequest(userId, friendId) {
        try {
            const friendship = await Friendship.findOne({
                where: {
                    userId: friendId,
                    friendId: userId,
                    status: 'pending'
                }
            });

            if (!friendship) {
                return {
                    status: 404,
                    msg: 'Friend request not found',
                    data: null
                };
            }

            friendship.status = 'accepted';
            await friendship.save();

            return {
                status: 200,
                msg: 'Friend request accepted successfully',
                data: friendship
            };
        } catch (error) {
            console.error('Accept friend request error:', error);
            return {
                status: 500,
                msg: 'Failed to accept friend request',
                data: null
            };
        }
    }

    /**
     * Get all friends of a user
     * @param {number} userId - ID of the user
     * @returns {Promise<Object>} - Response object with friends list
     */
    async getFriends(userId) {
        try {
            const friendships = await Friendship.findAll({
                where: {
                    [Op.or]: [
                        { userId, status: 'accepted' },
                        { friendId: userId, status: 'accepted' }
                    ]
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'friend',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }
                ]
            });

            // Transform the response to only include friend information
            const friends = friendships.map(friendship => {
                const friend = friendship.userId === userId ? friendship.friend : friendship.user;
                return {
                    id: friend.id,
                    firstName: friend.firstName,
                    lastName: friend.lastName,
                    email: friend.email
                };
            });

            return {
                status: 200,
                msg: 'Friends retrieved successfully',
                data: friends
            };
        } catch (error) {
            console.error('Get friends error:', error);
            return {
                status: 500,
                msg: 'Failed to retrieve friends',
                data: null
            };
        }
    }

    /**
     * Get pending friend requests
     * @param {number} userId - ID of the user
     * @returns {Promise<Object>} - Response object with pending requests
     */
    async getPendingRequests(userId) {
        try {
            const pendingRequests = await Friendship.findAll({
                where: {
                    friendId: userId,
                    status: 'pending'
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }
                ]
            });

            return {
                status: 200,
                msg: 'Pending requests retrieved successfully',
                data: pendingRequests
            };
        } catch (error) {
            console.error('Get pending requests error:', error);
            return {
                status: 500,
                msg: 'Failed to retrieve pending requests',
                data: null
            };
        }
    }

    /**
     * Reject a friend request
     * @param {number} userId - ID of the user rejecting the request
     * @param {number} friendId - ID of the user who sent the request
     * @returns {Promise<Object>} - Response object
     */
    async rejectFriendRequest(userId, friendId) {
        try {
            const friendship = await Friendship.findOne({
                where: {
                    userId: friendId,
                    friendId: userId,
                    status: 'pending'
                }
            });

            if (!friendship) {
                return {
                    status: 404,
                    msg: 'Friend request not found',
                    data: null
                };
            }

            await friendship.destroy();

            return {
                status: 200,
                msg: 'Friend request rejected successfully',
                data: null
            };
        } catch (error) {
            console.error('Reject friend request error:', error);
            return {
                status: 500,
                msg: 'Failed to reject friend request',
                data: null
            };
        }
    }

    /**
     * Remove a friend
     * @param {number} userId - ID of the user removing the friend
     * @param {number} friendId - ID of the friend to remove
     * @returns {Promise<Object>} - Response object
     */
    async removeFriend(userId, friendId) {
        try {
            const friendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { userId, friendId, status: 'accepted' },
                        { userId: friendId, friendId: userId, status: 'accepted' }
                    ]
                }
            });

            if (!friendship) {
                return {
                    status: 404,
                    msg: 'Friendship not found',
                    data: null
                };
            }

            await friendship.destroy();

            return {
                status: 200,
                msg: 'Friend removed successfully',
                data: null
            };
        } catch (error) {
            console.error('Remove friend error:', error);
            return {
                status: 500,
                msg: 'Failed to remove friend',
                data: null
            };
        }
    }
}

export default new FriendService(); 