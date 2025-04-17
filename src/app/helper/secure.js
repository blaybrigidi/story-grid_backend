import crypto from 'crypto';

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
 * Generates a secure random token
 * @param {number} length - Length of the token
 * @returns {string} - Generated token
 */
export const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Hashes a password using bcrypt
 * @param {string} password - Password to hash
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
    const salt = await crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex') + ':' + salt;
};

/**
 * Verifies a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to verify against
 * @returns {boolean} - Whether the password matches
 */
export const verifyPassword = (password, hash) => {
    const [hashedPassword, salt] = hash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hashedPassword === verifyHash;
};