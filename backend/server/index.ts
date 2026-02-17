import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import { logger } from "./utils/logger";

// Route imports
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import merchantRoutes from "./routes/merchants";
import paymentRoutes from "./routes/payments";
import webhookRoutes from "./routes/webhook";

export function createServer() {
  const app = express();

  // ============================================================================
  // Middleware
  // ============================================================================

  // Basic security headers
  app.use(helmet());

  // Rate limiting: 200 requests / 15 minutes per IP
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
  app.use(limiter);

  // CORS - allow only the configured frontend origin
  app.use(cors({ origin: config.FRONTEND_ORIGIN, optionsSuccessStatus: 200 }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // If running behind a proxy (prod), trust it so rate-limiter/ip works correctly
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  // Request logging (structured)
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // ============================================================================
  // API Routes
  // ============================================================================

  // Health check
  app.use("/api/health", healthRoutes);

  // Auth endpoints (users)
  app.use("/api/auth", authRoutes);

  // Merchant endpoints
  app.use("/api/merchants", merchantRoutes);

  // Payment endpoints
  app.use("/api/payments", paymentRoutes);
  
  // Webhook endpoint
  app.use("/api/webhook", webhookRoutes);
  // Also mount plural path for dashboard/frontend compatibility
  app.use("/api/webhooks", webhookRoutes);
  // Legacy endpoints for backwards compatibility
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "Crypto Payment Gateway API";
    res.json({ message: ping });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  // 404 handler
  app.use((req, res) => {
    logger.warn("404 Not Found", { method: req.method, path: req.path });
    res.status(404).json({
      error: "Endpoint not found",
      code: "NOT_FOUND",
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      logger.error("Unhandled error", {
        error: err.message,
        stack: err.stack,
      });

      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      });
    }
  );

  return app;
}

