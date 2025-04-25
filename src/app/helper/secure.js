import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-32-chars-long'; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts data using AES-256-CBC
 * @param {string} text - Data to encrypt
 * @returns {string} - Encrypted data
 */
export const encrypt = (text) => {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
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
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
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
export const verifyPassword = async (password, hash) => {
    console.log('Verifying password with bcrypt:');
    console.log('Password to verify:', password);
    console.log('Stored hash:', hash);
    
    // Try bcrypt verification
    const bcryptResult = await bcrypt.compare(password, hash);
    console.log('Bcrypt verification result:', bcryptResult);
    
    // Also try PBKDF2 for comparison
    try {
        const [pbkdf2Hash, salt] = hash.split(':');
        if (pbkdf2Hash && salt) {
            console.log('Attempting PBKDF2 verification:');
            console.log('PBKDF2 hash part:', pbkdf2Hash);
            console.log('PBKDF2 salt part:', salt);
            const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            console.log('PBKDF2 computed hash:', verifyHash);
            const pbkdf2Result = pbkdf2Hash === verifyHash;
            console.log('PBKDF2 verification result:', pbkdf2Result);
        }
    } catch (error) {
        console.log('PBKDF2 verification error:', error.message);
    }
    
    return bcryptResult;
}; 