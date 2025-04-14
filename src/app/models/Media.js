import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    storyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Stories', // Use the table name as a string to avoid circular dependency
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('image', 'audio', 'video'),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['storyId']
        },
        {
            fields: ['type']
        }
    ]
});

// Lazily load the Story model to define the association
import('./Story.js').then(({ default: Story }) => {
    Media.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });
});

export default Media;