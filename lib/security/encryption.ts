import crypto from 'crypto';

/**
 * ENCRYPTION UTILITY (AES-256-GCM)
 * 
 * Compliant with GDPR/CCPA for storing PII (Personally Identifiable Information).
 * Uses a unique IV for every encryption operation throughout the database.
 */

const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Fallback for dev only
const ALGORITHM = 'aes-256-gcm';

export const encryptionService = {
    /**
     * Encrypt sensitive text (e.g., Passport Number, Name)
     */
    encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag().toString('hex');
            
            // Format: IV:AuthTag:EncryptedData
            return `${iv.toString('hex')}:${authTag}:${encrypted}`;
        } catch (error) {
            console.error('[Encryption] Failed to encrypt data', error);
            throw new Error('Encryption failed');
        }
    },

    /**
     * Decrypt data for authorized viewing
     */
    decrypt(encryptedText: string): string {
        try {
            const parts = encryptedText.split(':');
            if (parts.length !== 3) throw new Error('Invalid encrypted format');
            
            const [ivHex, authTagHex, encryptedHex] = parts;
            
            const decipher = crypto.createDecipheriv(
                ALGORITHM, 
                Buffer.from(ENCRYPTION_KEY, 'hex'), 
                Buffer.from(ivHex, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
            
            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('[Encryption] Failed to decrypt data', error);
            return '***DECRYPTION_FAILED***';
        }
    }
};

