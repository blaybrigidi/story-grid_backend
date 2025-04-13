import * as secure from '../helper/secure.js';

export const decrypt = async (req) => {
    try {
        const { encryptedData } = req.body.data;
        
        if (!encryptedData) {
            return {
                status: 400,
                msg: 'Encrypted data is required',
                data: null
            };
        }

        const decryptedData = secure.decrypt(encryptedData);
        const parsedData = JSON.parse(decryptedData);

        return {
            status: 200,
            msg: 'Data decrypted successfully',
            data: parsedData
        };
    } catch (error) {
        console.error('Decryption error:', error);
        return {
            status: 500,
            msg: 'Failed to decrypt data',
            data: null
        };
    }
}; 