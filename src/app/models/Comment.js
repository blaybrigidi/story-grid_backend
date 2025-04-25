import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
            model: 'Stories',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
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
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['storyId'] },
        { fields: ['userId'] },
        { fields: ['parentId'] }
    ]
});

// Lazily load models to avoid circular dependencies
import('./User.js').then(({ default: User }) => {
    Comment.belongsTo(User, { foreignKey: 'userId' });
});

import('./Story.js').then(({ default: Story }) => {
    Comment.belongsTo(Story, { foreignKey: 'storyId' });
});

// Self-referencing relationship for nested comments
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

export default Comment;