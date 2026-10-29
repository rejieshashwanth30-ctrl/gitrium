import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

/**
 * Validates whether the server has a dedicated production encryption key configured.
 */
export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.trim().length >= 16);
}

/**
 * Returns a 32-byte key derived from server environment secret.
 * Enforces ENCRYPTION_KEY requirement for live production.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (!envKey || envKey.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY REQUIRED FOR PRODUCTION: Configure a 32-byte ENCRYPTION_KEY in your server environment."
      );
    }
    console.warn(
      "SECURITY WARNING: ENCRYPTION_KEY is missing from environment variables. Set ENCRYPTION_KEY for production security."
    );
    const fallbackSeed = process.env.DATABASE_URL || "gitrium-internal-dev-key-seed";
    return crypto.createHash("sha256").update(String(fallbackSeed)).digest();
  }

  return crypto.createHash("sha256").update(envKey.trim()).digest();
}

/**
 * Encrypts sensitive string (e.g. GitHub access token) using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptToken(token: string): string {
  if (!token) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted ciphertext back to plaintext.
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return "";
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    // If not matching format, might be unencrypted legacy or raw token
    return encryptedData;
  }

  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
