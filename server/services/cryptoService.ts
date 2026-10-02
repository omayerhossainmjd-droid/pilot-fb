import crypto from 'crypto';

// Encryption configuration for sensitive tokens (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'pagepilot-default-32-byte-secret-key-12345678';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt sensitive token using AES-256-GCM.
 * Output format: iv:tag:ciphertext (all hex-encoded)
 */
export function encryptToken(token: string): string {
  if (!token) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt token using AES-256-GCM.
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      // In case unencrypted token was passed in dev/mock mode
      return encryptedPayload;
    }
    const [ivHex, tagHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt token:', err);
    return '';
  }
}

/**
 * Validates HMAC SHA256 signature for incoming Meta webhooks.
 * Header: X-Hub-Signature-256: sha256={hash}
 */
export function verifyWebhookSignature(payload: string | Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader || !appSecret) return false;
  
  const [method, signature] = signatureHeader.split('=');
  if (method !== 'sha256' || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
