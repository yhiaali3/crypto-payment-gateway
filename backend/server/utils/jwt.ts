/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

import crypto from "crypto";
import { config } from "../config/env";

export interface TokenPayload {
  userId?: string;     // preferred subject (usr_...)
  merchantId?: string; // legacy / optional (mer_...)
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a simple JWT token
 * Note: In production, use a proper JWT library like jsonwebtoken
 */
export function generateToken(payload: TokenPayload): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const expirationTime = now + 7 * 24 * 60 * 60; // 7 days

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: expirationTime,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString(
    "base64url",
  );

  const signature = crypto
    .createHmac("sha256", config.JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export function signToken(payload: TokenPayload): string {
  return generateToken(payload);
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", config.JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (signatureB64 !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString(),
    ) as TokenPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
