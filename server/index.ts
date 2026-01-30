import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";

// Route imports
import healthRoutes from "./routes/health";
import merchantRoutes from "./routes/merchants";
import paymentRoutes from "./routes/payments";

export function createServer() {
  const app = express();

  // ============================================================================
  // Middleware
  // ============================================================================

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // ============================================================================
  // API Routes
  // ============================================================================

  // Health check
  app.use("/api/health", healthRoutes);

  // Merchant endpoints
  app.use("/api/merchants", merchantRoutes);

  // Payment endpoints
  app.use("/api/payments", paymentRoutes);

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
      _next: express.NextFunction,
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
    },
  );

  return app;
}
