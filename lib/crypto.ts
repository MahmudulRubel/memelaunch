import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Returns a 32-byte key derived from secret environment variable or server key fallback.
 */
function getDerivedKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.INSFORGE_SERVER_KEY || 'memelaunch-default-production-encryption-secret-key-32bytes!';
  return crypto.scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypts sensitive text string at rest using AES-256-GCM.
 * Output format: hex string containing salt:iv:tag:encryptedData
 */
export function encryptSensitiveData(text: string): string {
  if (!text) return '';
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = getDerivedKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted
    ].join(':');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts hex string back into original plain text.
 */
export function decryptSensitiveData(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted payload format');
    }

    const [saltHex, ivHex, tagHex, encryptedHex] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const key = getDerivedKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}
