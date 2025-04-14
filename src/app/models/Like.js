import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['storyId', 'userId'] },
        { fields: ['storyId'] },
        { fields: ['userId'] }
    ]
});

// Lazily load models to define associations
import('./Story.js').then(({ default: Story }) => {
    Like.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });
});
import('./User.js').then(({ default: User }) => {
    Like.belongsTo(User, { as: 'user', foreignKey: 'userId' });
});

export default Like;