import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'neondb',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres',
        port: process.env.DB_PORT || 5432,
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

// Test the connection and sync database
const testConnection = async () => {
    try {
        console.log('Attempting to connect to the database...');
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Dialect: ${process.env.DB_DIALECT}`);
        
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync database in development mode
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized successfully.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

testConnection();

export default sequelize; 