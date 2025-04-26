import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'your-fallback-secret', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts data using AES-256-CBC
 * @param {string} text - Data to encrypt
 * @returns {string} - Encrypted data
 */
export const encrypt = (data) => {
    try {
        if (!data) return null;
        
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        const encrypted = Buffer.concat([
            cipher.update(typeof data === 'string' ? data : JSON.stringify(data)),
            cipher.final()
        ]);
        
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypts data using AES-256-CBC
 * @param {string} text - Data to decrypt
 * @returns {string} - Decrypted data
 */
export const decrypt = (text) => {
    try {
        if (!text) return null;
        
        const [ivHex, encryptedHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        
        const result = decrypted.toString();
        try {
            return JSON.parse(result);
        } catch {
            return result;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Generates a secure random token or JWT token
 * @param {number|Object} param - Length of the token or user object for JWT
 * @returns {string} - Generated token
 */
export const generateToken = (param) => {
    console.log('Generating token with param type:', typeof param);
    
    if (typeof param === 'number') {
        console.log('Generating random token with length:', param);
        return crypto.randomBytes(param).toString('hex');
    }
    
    // If param is a user object, generate JWT token
    console.log('Generating JWT token for user:', param.id);
    const user = param;
    
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('JWT_SECRET is not defined');
    }
    
    try {
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('JWT token generated successfully');
        return token;
    } catch (error) {
        console.error('Error generating JWT token:', error);
        throw error;
    }
};

/**
 * Hashes a password using bcrypt
 * @param {string} password - Password to hash
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
    console.log('Hashing password with bcrypt:', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Bcrypt hashed password:', hashedPassword);
    return hashedPassword;
};

/**
 * Verifies a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to verify against
 * @returns {Promise<boolean>} - Whether the password matches
 */
export const verifyPassword = (password, hash) => {
    const [hashedPassword, salt] = hash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hashedPassword === verifyHash;
};