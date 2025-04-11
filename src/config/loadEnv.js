/** @format */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Load environment variables from .env file
 * @returns {void}
 */
export const loadEnv = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Load environment variables from .env file
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
    
    // Validate required environment variables
    const requiredEnvVars = [
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'DB_HOST',
        'DB_PORT',
        'JWT_SECRET',
        'EMAIL_SERVICE',
        'EMAIL_USER',
        'EMAIL_PASSWORD'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
        console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        process.exit(1);
    }
    
    console.log('Environment variables loaded successfully');
}; 