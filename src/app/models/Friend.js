import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Friend = sequelize.define('Friend', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    followerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    followingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'blocked'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['followerId', 'followingId']
        }
    ]
});

// Lazily load models to avoid circular dependencies
import('./User.js').then(({ default: User }) => {
    Friend.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
    Friend.belongsTo(User, { as: 'following', foreignKey: 'followingId' });
});

export default Friend; 