import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    friendId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'friendId']
        }
    ]
});

// Define associations
Friendship.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Friendship.belongsTo(User, { as: 'friend', foreignKey: 'friendId' });

export default Friendship; 