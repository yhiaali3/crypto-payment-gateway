/**
 * Authentication Middleware
 * Handles JWT verification and API key validation
 */

import { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";
import { db } from "../models/database";
import { logger } from "../utils/logger";

export interface AuthenticatedRequest extends Express.Request {
  merchantId?: string;
  apiKey?: string;
}

/**
 * JWT Bearer Token Authentication
 */
export const jwtAuth: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next,
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

  req.merchantId = payload.merchantId;
  next();
};

/**
 * API Key Authentication
 * Expects Authorization header: "ApiKey sk_xxxxx"
 */
export const apiKeyAuth: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("ApiKey ")) {
    return res.status(401).json({
      error: "Missing or invalid API key",
      code: "MISSING_API_KEY",
      timestamp: new Date().toISOString(),
    });
  }

  const apiKey = authHeader.substring(7);

  // Find merchant with this API key
  const merchants = db.getAllMerchants();
  let foundMerchant = null;

  for (const merchant of merchants) {
    for (const key of merchant.apiKeys) {
      if (key.key === apiKey) {
        foundMerchant = merchant;
        // Update last used time
        const now = new Date();
        key.lastUsedAt = now;
        db.updateMerchant(merchant.id, { apiKeys: merchant.apiKeys });
        break;
      }
    }
    if (foundMerchant) break;
  }

  if (!foundMerchant) {
    logger.warn("Invalid API key attempt", { apiKey: apiKey.substring(0, 10) });
    return res.status(401).json({
      error: "Invalid API key",
      code: "INVALID_API_KEY",
      timestamp: new Date().toISOString(),
    });
  }

  if (!foundMerchant.isActive) {
    return res.status(403).json({
      error: "Merchant account is inactive",
      code: "MERCHANT_INACTIVE",
      timestamp: new Date().toISOString(),
    });
  }

  req.merchantId = foundMerchant.id;
  req.apiKey = apiKey;
  next();
};

/**
 * Optional authentication (JWT or API Key)
 */
export const optionalAuth: RequestHandler = (
  req: AuthenticatedRequest,
  res,
  next,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      req.merchantId = payload.merchantId;
    }
  } else if (authHeader.startsWith("ApiKey ")) {
    const apiKey = authHeader.substring(7);
    const merchants = db.getAllMerchants();
    for (const merchant of merchants) {
      for (const key of merchant.apiKeys) {
        if (key.key === apiKey) {
          req.merchantId = merchant.id;
          return next();
        }
      }
    }
  }

  next();
};
