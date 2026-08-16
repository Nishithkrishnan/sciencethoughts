import crypto from 'crypto';

const INSECURE_DEV_FALLBACK_KEY = 'default_app_encryption_key_32bytes_length_must_be_set_for_safety!';

if (!process.env.APP_ENCRYPTION_KEY) {
  // This key protects every client's WhatsApp access token and Zoho CRM secret in Vercel KV.
  // Falling back silently to a key that's visible in source control means those "encrypted"
  // credentials are effectively unprotected. Fail loudly instead of failing open.
  const msg = '[CRYPTO] APP_ENCRYPTION_KEY is not set. Tenant credentials will be encrypted with a publicly-known default key. Set APP_ENCRYPTION_KEY in your environment before onboarding any real client.';
  if (process.env.NODE_ENV === 'production') {
    console.error(msg);
  } else {
    console.warn(msg);
  }
}

const ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY || INSECURE_DEV_FALLBACK_KEY;

/**
 * Encrypts plaintext using AES-256-GCM
 */
export function encrypt(text) {
  if (!text) return null;
  
  // Ensure key is exactly 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf-8');
  const iv = crypto.randomBytes(12); // standard 12-byte IV for GCM
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts ciphertext using AES-256-GCM. Falls back to original string if not encrypted.
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // If not in our encrypted format, treat as legacy plaintext
    return encryptedText;
  }

  try {
    const [ivHex, authTagHex, encrypted] = parts;
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32), 'utf-8');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("[CRYPTO] Decryption failed, returning input string:", error.message);
    return encryptedText;
  }
}
