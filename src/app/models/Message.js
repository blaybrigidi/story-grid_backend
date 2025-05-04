import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Conversations',
            key: 'id'
        }
    },
    senderId: {
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
    readBy: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['conversationId'] },
        { fields: ['senderId'] },
        { fields: ['createdAt'] }
    ]
});

// Lazily load models to avoid circular dependencies
import('./User.js').then(({ default: User }) => {
    Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
});

import('./Conversation.js').then(({ default: Conversation }) => {
    Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
});

export default Message; 