/**
 * Merchant API Routes
 * Handles merchant signup, login, and profile management
 */

import { Router, RequestHandler } from "express";
import { z } from "zod";
import { MerchantService } from "../services/merchant";
import { validateBody } from "../middlewares/validation";
import { jwtAuth, AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import prisma from "../utils/prisma";
import { verifyToken } from "../utils/jwt";
import {
  generateApiKey,
  generateApiSecret,
  generateMerchantId,
  hashPassword,
  hashApiKey,
  encryptSecret,
} from "../utils/crypto";
import { config } from "../config/env";
import {
  MerchantSignupRequest,
  MerchantLoginRequest,
  MerchantSignupResponse,
  MerchantLoginResponse,
  MerchantProfile,
  ApiKeyResponse,
} from "@shared/api";

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

// NOTE: Merchant signup/login moved to /api/auth — merchants routes now only manage merchant resources (create/profile/api-keys/etc.)

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

// ============================================================================
// Routes
// ============================================================================

// Merchant-level signup/login removed — use /api/auth for user signup/login (separation of concerns).

/**
 * GET /api/merchants/profile
 * Get current merchant profile (requires authentication)
 */
const handleGetProfile = async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const merchant = await MerchantService.getMerchantProfile(req.merchantId);

    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
        code: "NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }

    const response: MerchantProfile = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      website: merchant.website,
      webhookUrl: merchant.webhookUrl,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt.toISOString(),
      updatedAt: merchant.updatedAt.toISOString(),
    };

    res.json(response);
  } catch (error) {
    logger.error("Get profile error", { error: String(error) });

    res.status(500).json({
      error: "Failed to get profile",
      code: "GET_PROFILE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * PUT /api/merchants/profile
 * Update merchant profile
 */
const handleUpdateProfile = async (
  req: AuthenticatedRequest,
  res: any,
) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const updates = req.body;


    const merchant = await MerchantService.updateMerchantProfile(
      req.merchantId,
      updates,
    );

    if (!merchant) {
      return res.status(404).json({
        error: "Merchant not found",
        code: "NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }

    const response: MerchantProfile = {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      website: merchant.website,
      webhookUrl: merchant.webhookUrl,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt.toISOString(),
      updatedAt: merchant.updatedAt.toISOString(),
    };

    logger.info("Merchant profile updated", { merchantId: req.merchantId });

    res.json(response);
  } catch (error) {
    logger.error("Update profile error", { error: String(error) });

    res.status(500).json({
      error: "Failed to update profile",
      code: "UPDATE_PROFILE_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * POST /api/merchants/api-keys
 * Generate new API key
 */
const handleGenerateApiKey = async (
  req: AuthenticatedRequest,
  res: any,
) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const { apiKey, apiSecret } = await MerchantService.generateNewApiKey(req.merchantId);

    const response: ApiKeyResponse = {
      keyId: apiKey,
      key: apiKey,
      createdAt: new Date().toISOString(),
    };

    logger.info("New API key generated", { merchantId: req.merchantId });

    res.status(201).json(response);
  } catch (error) {
    logger.error("Generate API key error", { error: String(error) });

    res.status(500).json({
      error: "Failed to generate API key",
      code: "API_KEY_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

// ============================================================================
// Route Setup
// ============================================================================

// Merchant-level signup/login removed. Use /api/auth for user signup/login.
router.get("/profile", jwtAuth, handleGetProfile);
router.put(
  "/profile",
  jwtAuth,
  validateBody(updateProfileSchema),
  handleUpdateProfile,
);
router.post("/api-keys", jwtAuth, handleGenerateApiKey);

/**
 * POST /api/merchants/create
 * Create / bootstrap a merchant for the current JWT subject (frontend uses this)
 * - Reads merchantId/email from JWT payload
 * - If merchant already exists -> 409
 * - Otherwise create a merchant record (returns merchantId, apiKey, apiSecret)
 */
const handleCreateForJwt: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    // jwtAuth already ran and must populate req.userId
    const authHeader = (req.headers.authorization || "").toString();
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header", code: "MISSING_AUTH" });
    }

    // do not log JWT/payload content (sensitive)

    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token missing userId', code: 'MISSING_USERID' });
    }

    // Check existing merchant by userId (do NOT rely on merchantId claim)
    const existing = await prisma.merchant.findFirst({ where: { userId } });
    if (existing) {
      return res.status(409).json({ error: 'Merchant already exists', code: 'MERCHANT_EXISTS' });
    }

    // Optionally read email from token payload for naming; fallback to placeholder
    const token = authHeader.substring(7);
    const payload = verifyToken(token) || ({} as any);
    const tokenEmail = (payload.email as string) || undefined;

    const email = tokenEmail || `${generateMerchantId()}@example.invalid`;
    const name = (email.split('@')[0]) || 'merchant';

    // Ensure unique email (simple suffix if conflict)
    let finalEmail = email;
    const byEmail = await prisma.merchant.findUnique({ where: { email: finalEmail } });
    if (byEmail) finalEmail = `${Date.now()}_${finalEmail}`;

    // Create merchant record and associate with userId
    const newId = generateMerchantId();
    const randomPassword = Math.random().toString(36).slice(2, 12);
    const passwordHash = hashPassword(randomPassword);
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    // store encrypted apiKey & secret at rest and keep a lookup hash for apiKey
    const apiKeyHash = hashApiKey(apiKey, config.API_KEY_SECRET);
    const encryptedKey = encryptSecret(apiKey, config.API_KEY_SECRET);
    const encryptedSecret = encryptSecret(apiSecret, config.API_KEY_SECRET);

    const created = await prisma.merchant.create({
      data: {
        id: newId,
        userId,
        name,
        email: finalEmail,
        passwordHash,
        apiKeyHash,
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
        isActive: true,
      },
    });

    logger.info('Merchant created via /api/merchants/create', { merchantId: created.id, userId });

    // Return plaintext values to caller (they are not stored in plaintext in DB)
    return res.status(201).json({ merchantId: created.id, apiKey, apiSecret });
  } catch (err) {
    logger.error('Create merchant (JWT) error', { error: String(err) });
    return res.status(500).json({ error: 'Failed to create merchant', code: 'CREATE_MERCHANT_ERROR' });
  }
};

router.post('/create', jwtAuth, handleCreateForJwt);

export default router;
