import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Story from './Story.js';

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
            model: Story,
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

// Define associations
Media.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

export default Media; 