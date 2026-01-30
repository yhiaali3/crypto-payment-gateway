/**
 * Merchant Service
 * Handles all merchant-related business logic
 */

import { db } from "../models/database";
import { Merchant, ApiKey } from "../models/types";
import {
  generateMerchantId,
  generateApiKey,
  generateApiSecret,
  hashPassword,
  verifyPassword,
} from "../utils/crypto";
import { logger } from "../utils/logger";

export class MerchantService {
  /**
   * Create a new merchant
   */
  static createMerchant(
    name: string,
    email: string,
    password: string,
    website?: string,
    webhookUrl?: string,
  ): { merchant: Merchant; apiKey: string; apiSecret: string } {
    // Check if merchant already exists
    const existing = db.getMerchantByEmail(email);
    if (existing) {
      throw new Error("Merchant with this email already exists");
    }

    const merchantId = generateMerchantId();
    const passwordHash = hashPassword(password);
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const apiKeyObj: ApiKey = {
      id: apiKey,
      key: apiKey,
      keyHash: hashPassword(apiKey),
      createdAt: new Date(),
    };

    const merchant: Merchant = {
      id: merchantId,
      name,
      email,
      passwordHash,
      website,
      webhookUrl,
      apiKeys: [apiKeyObj],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.saveMerchant(merchant);
    logger.info("New merchant created", { merchantId, email });

    return {
      merchant,
      apiKey,
      apiSecret,
    };
  }

  /**
   * Authenticate merchant with email and password
   */
  static authenticate(email: string, password: string): Merchant | null {
    const merchant = db.getMerchantByEmail(email);

    if (!merchant) {
      return null;
    }

    const isValid = verifyPassword(password, merchant.passwordHash);
    if (!isValid) {
      logger.warn("Failed login attempt", { email });
      return null;
    }

    return merchant;
  }

  /**
   * Get merchant profile
   */
  static getMerchantProfile(merchantId: string): Merchant | null {
    const merchant = db.getMerchant(merchantId);
    return merchant || null;
  }

  /**
   * Generate new API key for merchant
   */
  static generateNewApiKey(merchantId: string): {
    apiKey: string;
    apiSecret: string;
  } {
    const merchant = db.getMerchant(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    const apiKeyObj: ApiKey = {
      id: apiKey,
      key: apiKey,
      keyHash: hashPassword(apiKey),
      createdAt: new Date(),
    };

    merchant.apiKeys.push(apiKeyObj);
    db.updateMerchant(merchantId, { apiKeys: merchant.apiKeys });

    logger.info("New API key generated", { merchantId });

    return { apiKey, apiSecret };
  }

  /**
   * Update merchant profile
   */
  static updateMerchantProfile(
    merchantId: string,
    updates: { name?: string; website?: string; webhookUrl?: string },
  ): Merchant | null {
    const merchant = db.getMerchant(merchantId);
    if (!merchant) {
      return null;
    }

    const updated = db.updateMerchant(merchantId, {
      ...updates,
      updatedAt: new Date(),
    });

    logger.info("Merchant profile updated", { merchantId });
    return updated || null;
  }

  /**
   * Deactivate merchant
   */
  static deactivateMerchant(merchantId: string): Merchant | null {
    const merchant = db.getMerchant(merchantId);
    if (!merchant) {
      return null;
    }

    const updated = db.updateMerchant(merchantId, { isActive: false });
    logger.info("Merchant deactivated", { merchantId });
    return updated || null;
  }
}
