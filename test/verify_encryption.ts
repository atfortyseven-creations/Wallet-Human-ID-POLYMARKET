import crypto from 'crypto';

const DEV_FALLBACK_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

function encrypt(text: string, encryptionKey: string) {
  const IV_LENGTH = 16;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipherKey = crypto.createHash('sha256').update(String(encryptionKey)).digest();
  
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + cipher.getAuthTag().toString('hex');
}

function decrypt(encryptedText: string, encryptionKey: string): string {
    const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
    
    const key = crypto.createHash('sha256').update(String(encryptionKey)).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const testMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const encrypted = encrypt(testMnemonic, DEV_FALLBACK_KEY);
console.log("Encrypted:", encrypted);
const decrypted = decrypt(encrypted, DEV_FALLBACK_KEY);
console.log("Decrypted:", decrypted);

if (testMnemonic === decrypted) {
    console.log("✅ Encryption/Decryption Consistency Verified!");
} else {
    console.error("❌ Encryption/Decryption Consistency FAILED!");
    process.exit(1);
}
