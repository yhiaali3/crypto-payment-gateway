/**
 * Merchant Routes Tests
 * Tests for merchant signup, login, and profile management
 */

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../models/database";
import { MerchantService } from "../services/merchant";
import { verifyPassword } from "../utils/crypto";

describe("MerchantService", () => {
  beforeEach(() => {
    // Clear database before each test
    db.clear();
  });

  describe("createMerchant", () => {
    it("should create a new merchant with valid data", () => {
      const result = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
        "https://example.com",
      );

      expect(result.merchant.id).toBeDefined();
      expect(result.merchant.name).toBe("Test Store");
      expect(result.merchant.email).toBe("test@example.com");
      expect(result.apiKey).toBeDefined();
      expect(result.apiSecret).toBeDefined();
    });

    it("should hash the password", () => {
      const result = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      expect(result.merchant.passwordHash).not.toBe("password123");
      expect(verifyPassword("password123", result.merchant.passwordHash)).toBe(
        true,
      );
    });

    it("should fail if merchant already exists", () => {
      MerchantService.createMerchant(
        "Store 1",
        "test@example.com",
        "password123",
      );

      expect(() => {
        MerchantService.createMerchant(
          "Store 2",
          "test@example.com",
          "password123",
        );
      }).toThrow("already exists");
    });

    it("should create with optional fields", () => {
      const result = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
        "https://example.com",
        "https://example.com/webhook",
      );

      const merchant = db.getMerchant(result.merchant.id);
      expect(merchant?.website).toBe("https://example.com");
      expect(merchant?.webhookUrl).toBe("https://example.com/webhook");
    });
  });

  describe("authenticate", () => {
    beforeEach(() => {
      MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );
    });

    it("should authenticate with correct credentials", () => {
      const merchant = MerchantService.authenticate(
        "test@example.com",
        "password123",
      );

      expect(merchant).toBeDefined();
      expect(merchant?.email).toBe("test@example.com");
      expect(merchant?.name).toBe("Test Store");
    });

    it("should return null with wrong password", () => {
      const merchant = MerchantService.authenticate(
        "test@example.com",
        "wrongpassword",
      );

      expect(merchant).toBeNull();
    });

    it("should return null with non-existent email", () => {
      const merchant = MerchantService.authenticate(
        "nonexistent@example.com",
        "password123",
      );

      expect(merchant).toBeNull();
    });
  });

  describe("getMerchantProfile", () => {
    it("should retrieve merchant by id", () => {
      const created = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const profile = MerchantService.getMerchantProfile(created.merchant.id);

      expect(profile).toBeDefined();
      expect(profile?.name).toBe("Test Store");
    });

    it("should return null for non-existent merchant", () => {
      const profile = MerchantService.getMerchantProfile("mer_nonexistent");
      expect(profile).toBeNull();
    });
  });

  describe("generateNewApiKey", () => {
    it("should generate a new API key", () => {
      const created = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const { apiKey } = MerchantService.generateNewApiKey(created.merchant.id);

      expect(apiKey).toBeDefined();
      expect(apiKey.startsWith("pk_")).toBe(true);
    });

    it("should add key to merchant's API keys", () => {
      const created = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const initialKeyCount = created.merchant.apiKeys.length;
      MerchantService.generateNewApiKey(created.merchant.id);

      const merchant = MerchantService.getMerchantProfile(created.merchant.id);
      expect(merchant?.apiKeys.length).toBe(initialKeyCount + 1);
    });

    it("should fail for non-existent merchant", () => {
      expect(() => {
        MerchantService.generateNewApiKey("mer_nonexistent");
      }).toThrow("not found");
    });
  });

  describe("updateMerchantProfile", () => {
    it("should update merchant details", () => {
      const created = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const updated = MerchantService.updateMerchantProfile(
        created.merchant.id,
        {
          name: "Updated Store",
          website: "https://updated.com",
        },
      );

      expect(updated?.name).toBe("Updated Store");
      expect(updated?.website).toBe("https://updated.com");
    });

    it("should return null for non-existent merchant", () => {
      const result = MerchantService.updateMerchantProfile("mer_nonexistent", {
        name: "Test",
      });

      expect(result).toBeNull();
    });
  });

  describe("deactivateMerchant", () => {
    it("should deactivate a merchant", () => {
      const created = MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const deactivated = MerchantService.deactivateMerchant(
        created.merchant.id,
      );

      expect(deactivated?.isActive).toBe(false);
    });

    it("should return null for non-existent merchant", () => {
      const result = MerchantService.deactivateMerchant("mer_nonexistent");
      expect(result).toBeNull();
    });
  });
});
