import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Media from './Media.js';
import Comment from './Comment.js';
import Like from './Like.js';

const Story = sequelize.define('Story', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    readTime: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['category']
        },
        {
            fields: ['publishedAt']
        }
    ]
});

// Define associations
Story.belongsTo(User, { as: 'author', foreignKey: 'userId' });
Story.hasMany(Media, { as: 'media', foreignKey: 'storyId' });
Story.hasMany(Comment, { as: 'comments', foreignKey: 'storyId' });
Story.hasMany(Like, { as: 'likes', foreignKey: 'storyId' });

export default Story; 