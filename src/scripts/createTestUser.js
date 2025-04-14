import '../config/loadEnv.js';
import sequelize from '../config/db_connect.js';
import User from '../app/models/User.js';
import Friendship from '../app/models/Friendship.js';

// Create test users
const createTestUsers = async () => {
  try {
    console.log('Creating test users...');
    
    // Create first test user
    const user1 = await User.create({
      username: 'Brigidi Blay',
      email: 'brigidiablay@gmail.com',
      password: 'password123',
      isEmailVerified: true
    });
    
    console.log('Created user 1:', user1.username);
    
    // Create second test user
    const user2 = await User.create({
      username: 'Yaw Budu',
      email: 'agyayaw2002@gmail.com',
      password: 'password123',
      isEmailVerified: true
    });
    
    console.log('Created user 2:', user2.username);
    
    // Create friendship between users
    const friendship = await Friendship.create({
      userId: user1.id,
      friendId: user2.id,
      status: 'accepted'
    });
    
    console.log('Created friendship between users');
    
    console.log('Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers(); 