/**
 * Crypto Utility Functions
 * Handles hashing, signatures, and key generation
 */

import crypto from "crypto";

/**
 * Generate a random API key
 */
export function generateApiKey(): string {
  return "pk_" + crypto.randomBytes(24).toString("hex");
}

/**
 * Generate a random API secret
 */
export function generateApiSecret(): string {
  return "sk_" + crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a password using SHA-256 with salt
 */
export function hashPassword(password: string, salt?: string): string {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, useSalt, 100000, 64, "sha512")
    .toString("hex");
  return `${useSalt}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(
  password: string,
  hashedPassword: string,
): boolean {
  try {
    const [salt, hash] = hashedPassword.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    return computedHash === hash;
  } catch {
    return false;
  }
}

/**
 * Generate HMAC signature for webhook verification
 * @param data - Data to sign
 * @param secret - Secret key to use for signing
 */
export function generateHmacSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verify HMAC signature
 */
export function verifyHmacSignature(
  data: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = generateHmacSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

/**
 * Generate a unique payment ID
 */
export function generatePaymentId(): string {
  return "pay_" + crypto.randomBytes(12).toString("hex");
}

/**
 * Generate a unique merchant ID
 */
export function generateMerchantId(): string {
  return "mer_" + crypto.randomBytes(12).toString("hex");
}

/**
 * Generate a payment address (mock - in production, generate from blockchain)
 */
export function generatePaymentAddress(): string {
  // Mock USDT TRC20 address format
  return "T" + crypto.randomBytes(21).toString("hex");
}
