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
            model: 'Stories', // Use table name as a string
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Use table name as a string
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
            model: 'Comments', // Use table name as a string
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
        { fields: ['storyId'] },
        { fields: ['userId'] },
        { fields: ['parentId'] }
    ]
});

// Lazily load models to define associations
import('./Story.js').then(({ default: Story }) => {
    Comment.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });
});
import('./User.js').then(({ default: User }) => {
    Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });
});
import('./Comment.js').then(({ default: ParentComment }) => {
    Comment.belongsTo(ParentComment, { as: 'parent', foreignKey: 'parentId' });
    Comment.hasMany(ParentComment, { as: 'replies', foreignKey: 'parentId' });
});

export default Comment;