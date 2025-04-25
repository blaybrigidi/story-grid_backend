/** @format */
import { Op } from 'sequelize';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';

export const sendFriendRequest = async (userId, friendId) => {
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
};

export const acceptFriendRequest = async (userId, friendId) => {
    try {
        console.log('Accepting friend request:');
        console.log('Current user ID (recipient):', userId);
        console.log('Friend ID (sender):', friendId);
        
        // Find the pending request
        const friendship = await Friendship.findOne({
            where: {
                userId: friendId,
                friendId: userId,
                status: 'pending'
            }
        });
        
        console.log('Friendship found:', friendship ? 'Yes' : 'No');
        if (friendship) {
            console.log('Friendship ID:', friendship.id);
            console.log('Current status:', friendship.status);
        } else {
            // Try to find if there's any friendship record at all
            const anyFriendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { userId: friendId, friendId: userId },
                        { userId, friendId }
                    ]
                }
            });
            
            console.log('Any friendship found:', anyFriendship ? 'Yes' : 'No');
            if (anyFriendship) {
                console.log('Friendship details:', {
                    id: anyFriendship.id,
                    userId: anyFriendship.userId,
                    friendId: anyFriendship.friendId,
                    status: anyFriendship.status
                });
            }
        }

        if (!friendship) {
            return {
                status: 404,
                msg: 'Friend request not found',
                data: null
            };
        }

        friendship.status = 'accepted';
        await friendship.save();
        console.log('Friendship status updated to:', friendship.status);

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
};

export const getFriends = async (userId) => {
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
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'friend',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });

        // Transform the response to only include friend information
        const friends = friendships.map(friendship => {
            const friend = friendship.userId === userId ? friendship.friend : friendship.user;
            return {
                id: friend.id,
                username: friend.username,
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
};

export const getPendingRequests = async (userId) => {
    try {
        const pendingRequests = await Friendship.findAll({
            where: {
                friendId: userId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }]
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
};

export const rejectFriendRequest = async (userId, friendId) => {
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
};

export const removeFriend = async (userId, friendId) => {
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
}; 