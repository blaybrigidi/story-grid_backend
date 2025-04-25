// decrypt-media.js
import crypto from 'crypto';

// Copy this from your .env file
const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 bytes

/**
 * Decrypts data using AES-256-CBC
 * @param {string} text - Data to decrypt
 * @returns {string} - Decrypted data
 */
const decrypt = (text) => {
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

// The encrypted data from your response
const encryptedData = process.argv[2];

if (!encryptedData) {
    console.error('Please provide the encrypted data as an argument');
    process.exit(1);
}

try {
    const decryptedData = decrypt(encryptedData);
    console.log('Decrypted data:');
    console.log(JSON.parse(decryptedData));
} catch (error) {
    console.error('Error:', error.message);
} 