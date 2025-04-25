import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    storyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Stories',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'storyId']
        }
    ]
});

// Lazily load models to avoid circular dependencies
import('./User.js').then(({ default: User }) => {
    Like.belongsTo(User, { foreignKey: 'userId' });
});

import('./Story.js').then(({ default: Story }) => {
    Like.belongsTo(Story, { foreignKey: 'storyId' });
});

export default Like;