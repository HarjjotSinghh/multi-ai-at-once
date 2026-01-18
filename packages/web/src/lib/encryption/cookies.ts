import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;
const SALT_LENGTH = 64;

/**
 * Get the encryption key from environment variables
 * @throws {Error} if ENCRYPTION_KEY is not set or invalid
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Ensure key is 64 hex characters (32 bytes for AES-256)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Derive a key from a password using PBKDF2
 * @param password - The password to derive from
 * @param salt - The salt to use
 * @returns Derived key
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

/**
 * Encrypt an object using AES-256-GCM
 * @param data - The data to encrypt
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(data: unknown): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const jsonString = JSON.stringify(data);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine salt + iv + encrypted + authTag
  const combined = Buffer.concat([
    salt,
    iv,
    Buffer.from(encrypted, 'hex'),
    authTag,
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt data that was encrypted using encrypt()
 * @param encryptedData - The encrypted data string
 * @returns The decrypted object
 * @throws {Error} if decryption fails
 */
export function decrypt<T = unknown>(encryptedData: string): T {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    combined.length - AUTH_TAG_LENGTH
  );

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted) as T;
}

/**
 * Hash a password using bcrypt
 * @param password - The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt-ts');
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 * @param password - The password to verify
 * @param hash - The hash to compare against
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcrypt-ts');
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random token
 * @param bytes - Number of bytes to generate (default 32)
 * @returns Random token as hex string
 */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
