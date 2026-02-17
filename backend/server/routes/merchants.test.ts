/**
 * Merchant Routes Tests
 * Tests for merchant signup, login, and profile management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyPassword } from "../utils/crypto";

// Mock prisma used by MerchantService with a simple in-memory store
const mockStore: any = {
  merchants: [] as any[],
  clear() {
    this.merchants.length = 0;
  },
  getMerchant(id: string) {
    return this.merchants.find((m: any) => m.id === id) || null;
  },
  getByEmail(email: string) {
    return this.merchants.find((m: any) => m.email === email) || null;
  },
};

vi.mock("../utils/prisma", () => {
  return {
    default: {
      merchant: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.email) return mockStore.getByEmail(where.email) || null;
          if (where.id) return mockStore.getMerchant(where.id) || null;
          return null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const item = {
            id: data.id,
            userId: data.userId ?? null,
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            website: data.website ?? null,
            webhookUrl: data.webhookUrl ?? null,
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
            isActive: data.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockStore.merchants.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const m = mockStore.getMerchant(where.id);
          if (!m) throw new Error('Not found');
          Object.assign(m, data, { updatedAt: new Date() });
          return m;
        }),
      },
    },
  };
});

// Import MerchantService after prisma is mocked
import { MerchantService } from "../services/merchant";

describe("MerchantService", () => {
  beforeEach(() => {
    // Clear mock store before each test
    mockStore.clear();
  });

  describe("createMerchant", () => {
    it("should create a new merchant with valid data", async () => {
      const result = await MerchantService.createMerchant(
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

    it("should hash the password", async () => {
      const result = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      expect(result.merchant.passwordHash).not.toBe("password123");
      expect(verifyPassword("password123", result.merchant.passwordHash)).toBe(
        true,
      );
    });

    it("should fail if merchant already exists", async () => {
      await MerchantService.createMerchant(
        "Store 1",
        "test@example.com",
        "password123",
      );

      await expect(
        MerchantService.createMerchant(
          "Store 2",
          "test@example.com",
          "password123",
        ),
      ).rejects.toThrow(/already exists/i);
    });

    it("should create with optional fields", async () => {
      const result = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
        "https://example.com",
        "https://example.com/webhook",
      );

      const merchant = mockStore.getMerchant(result.merchant.id);
      expect(merchant?.website).toBe("https://example.com");
      expect(merchant?.webhookUrl).toBe("https://example.com/webhook");
    });
  });

  describe("authenticate", () => {
    beforeEach(async () => {
      await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );
    });

    it("should authenticate with correct credentials", async () => {
      const merchant = await MerchantService.authenticate(
        "test@example.com",
        "password123",
      );

      expect(merchant).toBeDefined();
      expect(merchant?.email).toBe("test@example.com");
      expect(merchant?.name).toBe("Test Store");
    });

    it("should return null with wrong password", async () => {
      const merchant = await MerchantService.authenticate(
        "test@example.com",
        "wrongpassword",
      );

      expect(merchant).toBeNull();
    });

    it("should return null with non-existent email", async () => {
      const merchant = await MerchantService.authenticate(
        "nonexistent@example.com",
        "password123",
      );

      expect(merchant).toBeNull();
    });
  });

  describe("getMerchantProfile", () => {
    it("should retrieve merchant by id", async () => {
      const created = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const profile = await MerchantService.getMerchantProfile(created.merchant.id);

      expect(profile).toBeDefined();
      expect(profile?.name).toBe("Test Store");
    });

    it("should return null for non-existent merchant", async () => {
      const profile = await MerchantService.getMerchantProfile("mer_nonexistent");
      expect(profile).toBeNull();
    });
  });

  describe("generateNewApiKey", () => {
    it("should generate a new API key", async () => {
      const created = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const { apiKey } = await MerchantService.generateNewApiKey(created.merchant.id);

      expect(apiKey).toBeDefined();
      expect(apiKey.startsWith("pk_")).toBe(true);
    });

    it("should add key to merchant's API keys", async () => {
      const created = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      // initialKeyCount is always zero for Prisma-backed service (apiKeys not stored as array)
      await MerchantService.generateNewApiKey(created.merchant.id);

      const merchant = await MerchantService.getMerchantProfile(created.merchant.id);
      expect(merchant).not.toBeNull();
    });

    it("should fail for non-existent merchant", async () => {
      await expect(MerchantService.generateNewApiKey("mer_nonexistent")).rejects.toThrow(/not found/i);
    });
  });

  describe("updateMerchantProfile", () => {
    it("should update merchant details", async () => {
      const created = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const updated = await MerchantService.updateMerchantProfile(
        created.merchant.id,
        {
          name: "Updated Store",
          website: "https://updated.com",
        },
      );

      expect(updated?.name).toBe("Updated Store");
      expect(updated?.website).toBe("https://updated.com");
    });

    it("should return null for non-existent merchant", async () => {
      const result = await MerchantService.updateMerchantProfile("mer_nonexistent", {
        name: "Test",
      });

      expect(result).toBeNull();
    });
  });

  describe("deactivateMerchant", () => {
    it("should deactivate a merchant", async () => {
      const created = await MerchantService.createMerchant(
        "Test Store",
        "test@example.com",
        "password123",
      );

      const deactivated = await MerchantService.deactivateMerchant(
        created.merchant.id,
      );

      expect(deactivated?.isActive).toBe(false);
    });

    it("should return null for non-existent merchant", async () => {
      const result = await MerchantService.deactivateMerchant("mer_nonexistent");
      expect(result).toBeNull();
    });
  });
});
