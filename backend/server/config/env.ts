/**
 * Environment Configuration
 * All environment variables are validated here
 */

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${key}`);
};

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(getEnv("PORT", "3000")),
  HOST: getEnv("HOST", "0.0.0.0"),

  // JWT
  JWT_SECRET: getEnv("JWT_SECRET", "dev-secret-key-change-in-production"),
  JWT_EXPIRE: getEnv("JWT_EXPIRE", "7d"),

  // API Keys
  API_KEY_SECRET: getEnv(
    "API_KEY_SECRET",
    "dev-api-secret-change-in-production",
  ),

  // Webhook
  WEBHOOK_SECRET: getEnv(
    "WEBHOOK_SECRET",
    "dev-webhook-secret-change-in-production",
  ),
  WEBHOOK_RETRY_ATTEMPTS: parseInt(getEnv("WEBHOOK_RETRY_ATTEMPTS", "3")),
  WEBHOOK_RETRY_DELAY: parseInt(getEnv("WEBHOOK_RETRY_DELAY", "5000")),

  // Payment
  PAYMENT_TIMEOUT: parseInt(getEnv("PAYMENT_TIMEOUT", "1800000")), // 30 minutes in ms

  // Frontend origin (CORS) - set in .env for production
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),

  // Binance Pay (placeholder for integration)
  BINANCE_PAY_API_KEY: getEnv("BINANCE_PAY_API_KEY", ""),
  BINANCE_PAY_SECRET_KEY: getEnv("BINANCE_PAY_SECRET_KEY", ""),

  // Tron/USDT (placeholder for integration)
  TRON_GRID_API_KEY: getEnv("TRON_GRID_API_KEY", ""),
  TRON_RPC_URL: getEnv("TRON_RPC_URL", "https://api.trongrid.io"),

  // Logging
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
};
