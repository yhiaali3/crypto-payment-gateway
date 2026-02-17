/**
 * Merchant Service (Prisma-backed)
 */

import { randomUUID } from "crypto";
import prisma from "../utils/prisma";
import { Merchant, ApiKey } from "../models/types";
import {
  generateMerchantId,
  generateUserId,
  generateApiKey,
  generateApiSecret,
  hashPassword,
  verifyPassword,
  hashApiKey,
  encryptSecret,
  decryptSecret,
} from "../utils/crypto";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { generateToken } from "../utils/jwt";

export class MerchantService {
  /**
   * Create a new merchant
   */
  static async createMerchant(
    name: string,
    email: string,
    password: string,
    website?: string,
    webhookUrl?: string,
    userId?: string,
  ): Promise<{ merchant: Merchant; apiKey: string; apiSecret: string }> {
    // Check if merchant already exists
    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Merchant with this email already exists");
    }

    const merchantId = generateMerchantId();
    const passwordHash = hashPassword(password);
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    // store a non-reversible hash for lookup and encrypt secret at rest
    const apiKeyHash = hashApiKey(apiKey, config.API_KEY_SECRET);
    const encryptedSecret = encryptSecret(apiSecret, config.API_KEY_SECRET);

    const apiKeyObj: ApiKey = {
      id: apiKey,
      key: apiKey,
      keyHash: hashPassword(apiKey),
      createdAt: new Date(),
    };

    const data: any = {
      id: merchantId,
      name,
      email,
      passwordHash,
      website,
      webhookUrl,
      apiKeyHash,
      apiKey: encryptSecret(apiKey, config.API_KEY_SECRET),
      apiSecret: encryptedSecret,
      isActive: true,
    };

    if (userId) data.userId = userId;

    const created = await prisma.merchant.create({ data });

    logger.info("New merchant created", { merchantId, email });

    const merchant: Merchant = {
      id: created.id,
      userId: created.userId ?? undefined,
      name: created.name,
      email: created.email,
      passwordHash: created.passwordHash,
      website: created.website ?? undefined,
      webhookUrl: created.webhookUrl ?? undefined,
      apiKeys: [apiKeyObj],
      isActive: created.isActive,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return { merchant, apiKey, apiSecret };
  }

  /**
   * Authenticate merchant with email and password
   */
  static async authenticate(email: string, password: string): Promise<Merchant | null> {
    const m = await prisma.merchant.findUnique({ where: { email } });
    if (!m) return null;
    const isValid = verifyPassword(password, m.passwordHash);
    if (!isValid) {
      logger.warn("Failed login attempt", { email });
      return null;
    }

    return {
      id: m.id,
      userId: m.userId ?? undefined,
      name: m.name,
      email: m.email,
      passwordHash: m.passwordHash,
      website: m.website ?? undefined,
      webhookUrl: m.webhookUrl ?? undefined,
      apiKeys: [],
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  /**
   * Log in merchant — verifies credentials, returns merchant record + apiKey + JWT
   */
  static async loginMerchant(email: string, password: string): Promise<{ merchant: Merchant; apiKey: string; token: string } | null> {
    const m = await prisma.merchant.findUnique({ where: { email } });
    if (!m) {
      logger.warn('Login failed - merchant not found', { email });
      return null;
    }

    const isValid = verifyPassword(password, m.passwordHash);
    if (!isValid) {
      logger.warn('Login failed - invalid password', { email });
      return null;
    }

    // Token should carry `userId` when merchant is linked to a user.
    // For legacy rows without `userId`, include `merchantId` in the token instead.
    const tokenPayload: any = { email: m.email };
    if (m.userId) tokenPayload.userId = m.userId;
    else tokenPayload.merchantId = m.id;

    const token = generateToken(tokenPayload);

    const merchant: Merchant = {
      id: m.id,
      userId: m.userId ?? undefined,
      name: m.name,
      email: m.email,
      passwordHash: m.passwordHash,
      website: m.website ?? undefined,
      webhookUrl: m.webhookUrl ?? undefined,
      apiKeys: [],
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };

    // decrypt stored apiKey if encrypted (preserve backward compatibility)
    let returnedApiKey = m.apiKey as string | undefined;
    try {
      if (returnedApiKey && returnedApiKey.includes(":")) {
        returnedApiKey = decryptSecret(returnedApiKey, config.API_KEY_SECRET);
      }
    } catch {
      // fall back to raw value if decryption fails (legacy)
    }

    return { merchant, apiKey: returnedApiKey, token };
  }

  /**
   * Get merchant profile
   */
  static async getMerchantProfile(merchantId: string): Promise<Merchant | null> {
    const m = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) return null;
    return {
      id: m.id,
      userId: m.userId ?? undefined,
      name: m.name,
      email: m.email,
      passwordHash: m.passwordHash,
      website: m.website ?? undefined,
      webhookUrl: m.webhookUrl ?? undefined,
      apiKeys: [],
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  /**
   * Generate new API key for merchant
   */
  static async generateNewApiKey(merchantId: string): Promise<{ apiKey: string; apiSecret: string }> {
    const m = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!m) throw new Error('Merchant not found');

    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    // store hashed key for lookup and encrypt secret at rest
    const apiKeyHash = hashApiKey(apiKey, config.API_KEY_SECRET);
    const encryptedSecret = encryptSecret(apiSecret, config.API_KEY_SECRET);

    // Note: for simplicity we store single apiKey/apiSecret on merchant record
    await prisma.merchant.update({ where: { id: merchantId }, data: { apiKeyHash, apiKey: encryptSecret(apiKey, config.API_KEY_SECRET), apiSecret: encryptedSecret } });

    logger.info('New API key generated', { merchantId });

    return { apiKey, apiSecret };
  }

  /**
   * Update merchant profile
   */
  static async updateMerchantProfile(merchantId: string, updates: { name?: string; website?: string; webhookUrl?: string }): Promise<Merchant | null> {
    const m = await prisma.merchant.update({ where: { id: merchantId }, data: { ...updates } }).catch(() => null);
    if (!m) return null;
    logger.info('Merchant profile updated', { merchantId });
    return {
      id: m.id,
      userId: m.userId ?? undefined,
      name: m.name,
      email: m.email,
      passwordHash: m.passwordHash,
      website: m.website ?? undefined,
      webhookUrl: m.webhookUrl ?? undefined,
      apiKeys: [],
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  static async deactivateMerchant(merchantId: string): Promise<Merchant | null> {
    const m = await prisma.merchant.update({ where: { id: merchantId }, data: { isActive: false } }).catch(() => null);
    if (!m) return null;
    logger.info('Merchant deactivated', { merchantId });
    return {
      id: m.id,
      userId: m.userId ?? undefined,
      name: m.name,
      email: m.email,
      passwordHash: m.passwordHash,
      website: m.website ?? undefined,
      webhookUrl: m.webhookUrl ?? undefined,
      apiKeys: [],
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }
}
