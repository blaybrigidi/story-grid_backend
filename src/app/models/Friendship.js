import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Use table name as a string
            key: 'id'
        }
    },
    friendId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Use table name as a string
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'friendId']
        }
    ]
});

// Lazily load models to define associations
import('./User.js').then(({ default: User }) => {
    Friendship.belongsTo(User, { as: 'user', foreignKey: 'userId' });
    Friendship.belongsTo(User, { as: 'friend', foreignKey: 'friendId' });
});

export default Friendship;