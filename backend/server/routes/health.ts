/**
 * Health Check Route
 * Simple endpoint to verify server is running
 */

import { Router, RequestHandler } from "express";
import { HealthCheckResponse } from "@shared/api";

const router = Router();

const handleHealthCheck: RequestHandler = (req, res) => {
  const response: HealthCheckResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };

  res.json(response);
};

router.get("/", handleHealthCheck);

export default router;
