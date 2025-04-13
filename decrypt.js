import crypto from 'crypto';

const ENCRYPTION_KEY = '12345678901234567890123456789012'; // Same key from your .env
const IV_LENGTH = 16;

function decrypt(text) {
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
}

// The encrypted response from your signup
const encryptedResponse = "cc3a3c7fd10e8f3fd038167abde5d4b4:304ee8d6b9d80e15447f3fa3ef1f28fbb9d8f5d3c7e72ca51c29afc7bbc3391d873e594929373193c84df94753bbd40e037825244f8f72f6c7915312de76e0765b58f25ec571a3f933545fec0b7937603bfcd4f24dff7c16aeea5fe5b1e3611f932c730df291a0f2f6e6696498c11364f363541fc064d1173d8a246965d739eb5b8e0c5097c19f705e23d8c9e092fe8e7960fa148a7de5341f07577efa25079887e7987daa0b9831bc59e0c1feacb47ca8e00d28b102ea8e71b7628e623be9956a9d73cb2701827dcf97ab3642cf9b3b9895ddbf5803f8886535bea5d75055de6678781fa19f872cbcbdd51299a9f63a4089049328fec1568a71d2db0d0fb18f9e276ae383984048d0befa8cb8962575747363607c4da27280c8114a41006f3952c5633bb3da17b3d010c93905af3a6e506670effea1d52279cc95ad9acaa6e75d1427385d49db9ec9f999d55097ff5cbdf59016197981475cb9372886d2721f7e6192b24cf483a2a8b6674fd4254312b8df5681d72ff17db4ed2e1361cb7b04";

try {
    const decrypted = decrypt(encryptedResponse);
    console.log('Decrypted data:', JSON.parse(decrypted));
} catch (error) {
    console.error('Error:', error.message);
} 