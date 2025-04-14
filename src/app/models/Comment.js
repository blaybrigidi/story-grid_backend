import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Story from './Story.js';
import User from './User.js';

const Comment = sequelize.define('Comment', {
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
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Comments',
            key: 'id'
        }
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['storyId']
        },
        {
            fields: ['userId']
        },
        {
            fields: ['parentId']
        }
    ]
});

// Define associations
Comment.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

export default Comment; 