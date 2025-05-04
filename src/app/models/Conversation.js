import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    isGroupChat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['lastMessageAt'] }
    ]
});

// Lazily load models to avoid circular dependencies
import('./Message.js').then(({ default: Message }) => {
    Conversation.hasMany(Message, { foreignKey: 'conversationId' });
});

import('./User.js').then(({ default: User }) => {
    // This will be set up through ConversationParticipant model
});

export default Conversation; 