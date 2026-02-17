/**
 * Authentication Middleware
 * Handles JWT verification and API key validation
 */

import { RequestHandler, Request } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../utils/prisma";
import { logger } from "../utils/logger";
import { hashApiKey } from "../utils/crypto";
import { config } from "../config/env";

export interface AuthenticatedRequest extends Request {
  merchantId?: string;
  userId?: string; // alias for middleware: token subject (merchant id)
  apiKey?: string;
}

/**
 * JWT Bearer Token Authentication
 */
export const jwtAuth = async (
  req: AuthenticatedRequest,
  res: any,
  next: any,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header",
      code: "MISSING_AUTH",
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
      timestamp: new Date().toISOString(),
    });
  }

  // Preferred: token carries `userId` (usr_...)
  if (payload.userId) {
    req.userId = payload.userId;
  }

  // Preserve merchantId if token contains it (legacy tokens)
  if (payload.merchantId) {
    req.merchantId = payload.merchantId;
  }

  // If token provided userId, try to resolve a linked merchantId (so legacy routes relying on req.merchantId keep working)
  if (req.userId && !req.merchantId) {
    try {
      const linked = await prisma.merchant.findFirst({ where: { userId: req.userId }, select: { id: true } });
      if (linked && linked.id) req.merchantId = linked.id;
    } catch (err) {
      logger.error('jwtAuth lookup merchantId by userId failed', err);
    }
  }

  // If token had only merchantId but no userId, try to resolve userId from DB (backfill support)
  if (!req.userId && req.merchantId) {
    try {
      const m = await prisma.merchant.findUnique({ where: { id: req.merchantId }, select: { userId: true } });
      if (m && m.userId) req.userId = m.userId;
    } catch (err) {
      logger.error('jwtAuth lookup userId by merchantId failed', err);
    }
  }

  next();
};

/**
 * API Key Authentication
 * Expects Authorization header: "ApiKey sk_xxxxx"
 */
export const apiKeyAuth = (
  req: AuthenticatedRequest,
  res: any,
  next: any,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("ApiKey ")) {
    return res.status(401).json({
      error: "Missing or invalid API key",
      code: "MISSING_API_KEY",
      timestamp: new Date().toISOString(),
    });
  }

  (async () => {
    const apiKey = authHeader.substring(7);
    try {
      // Prefer lookup by hashed API key (non-reversible). Fall back to plaintext for legacy rows.
      const keyHash = hashApiKey(apiKey, config.API_KEY_SECRET);
      let merchant = await prisma.merchant.findFirst({ where: { apiKeyHash: keyHash } as any });
      if (!merchant) {
        // legacy fallback (older rows may still contain plaintext apiKey)
        merchant = await prisma.merchant.findFirst({ where: { apiKey } as any });
      }

      if (!merchant) {
        // Do NOT log raw API key — only indicate a failed attempt
        logger.warn("Invalid API key attempt");
        return res.status(401).json({ error: "Invalid API key", code: "INVALID_API_KEY", timestamp: new Date().toISOString() });
      }

      if (!merchant.isActive) {
        return res.status(403).json({ error: "Merchant account is inactive", code: "MERCHANT_INACTIVE", timestamp: new Date().toISOString() });
      }

      req.merchantId = merchant.id;
      req.userId = merchant.id;
      req.apiKey = apiKey;
      return next();
    } catch (err) {
      logger.error('API key auth error', { error: String(err) });
      return res.status(500).json({ error: 'Authentication error', code: 'AUTH_ERROR', timestamp: new Date().toISOString() });
    }
  })();
};

/**
 * Optional authentication (JWT or API Key)
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: any,
  next: any,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      if (payload.userId) req.userId = payload.userId;
      if (payload.merchantId) req.merchantId = payload.merchantId;
      // try to resolve missing userId from merchant record
      if (!req.userId && payload.merchantId) {
        (async () => {
          try {
            const m = await prisma.merchant.findUnique({ where: { id: payload.merchantId }, select: { userId: true } });
            if (m && m.userId) req.userId = m.userId;
          } catch (err) {
            logger.error('optionalAuth lookup userId failed', err);
          }
        })();
      }
    }
  } else if (authHeader.startsWith("ApiKey ")) {
    const apiKey = authHeader.substring(7);
    (async () => {
      try {
        const keyHash = hashApiKey(apiKey, config.API_KEY_SECRET);
        let merchant = await prisma.merchant.findFirst({ where: { apiKeyHash: keyHash } as any });
        if (!merchant) {
          merchant = await prisma.merchant.findFirst({ where: { apiKey } as any });
        }
        if (merchant) {
          req.userId = merchant.userId || merchant.id;
          req.merchantId = merchant.id;
        }
      } catch (err) {
        logger.error('optionalAuth apiKey error', { error: String(err) });
      } finally {
        return next();
      }
    })();
    return;
  }

  next();
};
