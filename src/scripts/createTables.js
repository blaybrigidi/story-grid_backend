import '../config/loadEnv.js';
import sequelize from '../config/db_connect.js';

// Import all models
import '../app/models/User.js';
import '../app/models/Story.js';
import '../app/models/Comment.js';
import '../app/models/Like.js';
import '../app/models/Media.js';
import '../app/models/Friendship.js';

// Sync all models with the database
const createTables = async () => {
  try {
    console.log('Starting database synchronization...');
    
    // Force sync will drop existing tables and recreate them
    // Use with caution in production!
    await sequelize.sync({ force: true });
    
    console.log('All tables have been created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables(); 