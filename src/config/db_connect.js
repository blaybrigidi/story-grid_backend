/** @format */
import { Sequelize } from 'sequelize';
import { loadEnv } from './loadEnv.js';

// Load environment variables
loadEnv();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: (msg) => console.log(`[Sequelize] ${msg}`),
        dialectOptions: {
            connectTimeout: 60000, // 60 seconds
            ssl: process.env.DB_SSL === 'true' ? {
                rejectUnauthorized: false
            } : false
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 60000, // 60 seconds
            idle: 10000
        }
    }
);

// Test database connection
const testConnection = async () => {
    try {
        console.log('Attempting to connect to the database...');
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Dialect: postgres`);
        
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

// Export sequelize instance and test connection function
export { testConnection };
export default sequelize; 