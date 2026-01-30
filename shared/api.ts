/**
 * Shared types between client and server
 * Crypto Payment Gateway API
 */

// ============================================================================
// MERCHANT TYPES
// ============================================================================

export interface MerchantSignupRequest {
  name: string;
  email: string;
  password: string;
  website?: string;
  webhookUrl?: string;
}

export interface MerchantSignupResponse {
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  email: string;
  createdAt: string;
}

export interface MerchantLoginRequest {
  email: string;
  password: string;
}

export interface MerchantLoginResponse {
  token: string;
  merchantId: string;
  email: string;
  name: string;
}

export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  website?: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentCurrency = "USDT" | "BNB" | "ETH" | "BTC";
export type PaymentNetwork = "TRC20" | "BSC" | "ERC20" | "BITCOIN";
export type PaymentMethod = "binance_pay" | "usdt_trc20" | "crypto_wallet";
export type PaymentStatus = "pending" | "confirmed" | "failed" | "expired";

export interface CreatePaymentRequest {
  amount: number;
  currency: PaymentCurrency;
  network: PaymentNetwork;
  paymentMethod: PaymentMethod;
  customerReference: string;
  callbackUrl?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
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
  expiresAt: string;
  confirmedAt?: string;
  amountReceived?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  amountReceived?: number;
  currency: PaymentCurrency;
  txHash?: string;
  confirmedAt?: string;
  expiresAt: string;
  network: PaymentNetwork;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookPayload {
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  amountReceived?: number;
  currency: PaymentCurrency;
  txHash?: string;
  confirmedAt?: string;
  customerReference: string;
  timestamp: string;
  signature: string;
}

export interface WebhookSignatureVerification {
  isValid: boolean;
  message?: string;
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export interface ApiKeyResponse {
  keyId: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
}
