import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoryBlock = sequelize.define('StoryBlock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  storyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Stories',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  caption: {
    type: DataTypes.TEXT
  },
  fileUrl: {
    type: DataTypes.STRING
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['storyId'] },
    { fields: ['type'] },
    { fields: ['order'] }
  ]
});

export default StoryBlock;
