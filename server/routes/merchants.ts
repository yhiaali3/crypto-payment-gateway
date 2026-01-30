/**
 * Merchant API Routes
 * Handles merchant signup, login, and profile management
 */

import { Router, RequestHandler } from "express";
import { z } from "zod";
import { MerchantService } from "../services/merchant";
import { generateToken } from "../utils/jwt";
import { validateBody } from "../middlewares/validation";
import { jwtAuth, AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
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

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  website: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/merchants/signup
 * Register a new merchant
 */
const handleSignup: RequestHandler = (req, res) => {
  try {
    const data = req.body as MerchantSignupRequest;

    const result = MerchantService.createMerchant(
      data.name,
      data.email,
      data.password,
      data.website,
      data.webhookUrl,
    );

    const response: MerchantSignupResponse = {
      merchantId: result.merchant.id,
      apiKey: result.apiKey,
      apiSecret: result.apiSecret,
      email: result.merchant.email,
      createdAt: result.merchant.createdAt.toISOString(),
    };

    logger.info("Merchant signup successful", { email: data.email });

    res.status(201).json(response);
  } catch (error) {
    logger.error("Merchant signup error", { error: String(error) });

    if (error instanceof Error && error.message.includes("already exists")) {
      return res.status(409).json({
        error: error.message,
        code: "MERCHANT_EXISTS",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(500).json({
      error: "Failed to create merchant",
      code: "SIGNUP_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * POST /api/merchants/login
 * Authenticate merchant and return JWT token
 */
const handleLogin: RequestHandler = (req, res) => {
  try {
    const data = req.body as MerchantLoginRequest;

    const merchant = MerchantService.authenticate(data.email, data.password);

    if (!merchant) {
      logger.warn("Login failed", { email: data.email });
      return res.status(401).json({
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
        timestamp: new Date().toISOString(),
      });
    }

    const token = generateToken({
      merchantId: merchant.id,
      email: merchant.email,
    });

    const response: MerchantLoginResponse = {
      token,
      merchantId: merchant.id,
      email: merchant.email,
      name: merchant.name,
    };

    logger.info("Merchant login successful", { merchantId: merchant.id });

    res.json(response);
  } catch (error) {
    logger.error("Login error", { error: String(error) });

    res.status(500).json({
      error: "Login failed",
      code: "LOGIN_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * GET /api/merchants/profile
 * Get current merchant profile (requires authentication)
 */
const handleGetProfile: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const merchant = MerchantService.getMerchantProfile(req.merchantId);

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
const handleUpdateProfile: RequestHandler = (
  req: AuthenticatedRequest,
  res,
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

    const merchant = MerchantService.updateMerchantProfile(
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
const handleGenerateApiKey: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const { apiKey, apiSecret } = MerchantService.generateNewApiKey(
      req.merchantId,
    );

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

router.post("/signup", validateBody(signupSchema), handleSignup);
router.post("/login", validateBody(loginSchema), handleLogin);
router.get("/profile", jwtAuth, handleGetProfile);
router.put(
  "/profile",
  jwtAuth,
  validateBody(updateProfileSchema),
  handleUpdateProfile,
);
router.post("/api-keys", jwtAuth, handleGenerateApiKey);

export default router;
