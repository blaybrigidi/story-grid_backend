import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Story from './Story.js';
import User from './User.js';

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    storyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Story,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['storyId', 'userId']
        },
        {
            fields: ['storyId']
        },
        {
            fields: ['userId']
        }
    ]
});

// Define associations
Like.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });
Like.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default Like; 