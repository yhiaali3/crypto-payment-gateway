/**
 * Data Model Type Definitions
 * Used throughout the application for type safety
 */

import {
  PaymentStatus,
  PaymentCurrency,
  PaymentNetwork,
  PaymentMethod,
} from "@shared/api";

export interface Merchant {
  id: string;
  userId?: string; // optional user identity (usr_...)
  name: string;
  email: string;
  passwordHash: string;
  website?: string;
  webhookUrl?: string;
  apiKeys: ApiKey[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  key: string;
  keyHash: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface Payment {
  id: string;
  merchantId: string;
  amount: number;
  currency: PaymentCurrency;
  network: PaymentNetwork;
  paymentMethod: PaymentMethod;
  customerReference: string;
  status: PaymentStatus;
  paymentAddress?: string;
  paymentLink?: string;
  txHash?: string;
  expiresAt: Date;
  confirmedAt?: Date;
  amountReceived?: number;
  callbackUrl?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookLog {
  id: string;
  paymentId: string;
  merchantId: string;
  url: string;
  payload: unknown;
  status: number;
  response?: unknown;
  retries: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
