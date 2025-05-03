import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    lastReadMessageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Messages',
            key: 'id'
        }
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['conversationId'] },
        { fields: ['userId'] },
        {
            unique: true,
            fields: ['conversationId', 'userId']
        }
    ]
});

// Lazily load models to avoid circular dependencies
import('./User.js').then(({ default: User }) => {
    ConversationParticipant.belongsTo(User, { foreignKey: 'userId' });
});

import('./Conversation.js').then(({ default: Conversation }) => {
    ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });
    Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId' });
});

import('./Message.js').then(({ default: Message }) => {
    ConversationParticipant.belongsTo(Message, { 
        as: 'lastReadMessage', 
        foreignKey: 'lastReadMessageId' 
    });
});

export default ConversationParticipant; 