import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log environment
console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'DB_NAME',
  'DB_USER',
  'DB_HOST',
  'DB_DIALECT',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`[ERROR] Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

export default process.env; 