/**
 * Admin setup script for troubleshooting
 * 
 * This script creates an admin user directly in the database
 * and tests the admin login functionality
 */

import '../config/loadEnv.js';
import sequelize from '../app/config/database.js';
import User from '../app/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const TEST_ADMIN = {
  username: 'admintest',
  email: 'admintest@example.com',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'Test',
  role: 'admin',
  isEmailVerified: true
};

// Generate a JWT token for the admin
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'admin-secret-key',
    { expiresIn: '7d' }
  );
};

// Create admin user directly with Sequelize
const createAdminUser = async () => {
  try {
    console.log('=== Admin Setup Script ===');
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Successfully connected to database');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        email: TEST_ADMIN.email 
      } 
    });
    
    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${TEST_ADMIN.email}`);
      
      // Test admin login
      console.log('Testing admin login...');
      const isValidPassword = await bcrypt.compare(TEST_ADMIN.password, existingAdmin.password);
      console.log(`Password verification result: ${isValidPassword}`);
      
      if (isValidPassword) {
        console.log('Login successful!');
        const token = generateToken(existingAdmin);
        console.log('Admin token:', token);
      } else {
        console.log('Login failed: Invalid password');
        console.log('Updating admin password...');
        
        // Let the model hooks handle the password hashing
        await existingAdmin.update({ password: TEST_ADMIN.password });
        console.log('Admin password updated successfully');
        
        const token = generateToken(existingAdmin);
        console.log('Admin token:', token);
      }
      
      return;
    }
    
    // Create new admin user
    console.log('Creating new admin user...');
    
    // Let the model hooks handle the password hashing
    const admin = await User.create({
      username: TEST_ADMIN.username,
      email: TEST_ADMIN.email,
      password: TEST_ADMIN.password,
      firstName: TEST_ADMIN.firstName,
      lastName: TEST_ADMIN.lastName,
      role: 'admin',
      isEmailVerified: true
    });
    
    console.log('Admin user created successfully:');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    
    // Generate admin token
    const token = generateToken(admin);
    console.log('Admin token:', token);
    
    console.log('\n=== CURL COMMAND FOR ADMIN LOGIN ===');
    console.log(`curl -X POST http://localhost:3000/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {
      "email": "${TEST_ADMIN.email}",
      "password": "${TEST_ADMIN.password}"
    }
  }'`);
    
  } catch (error) {
    console.error('Error in admin setup:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
};

// Run the function
createAdminUser(); 