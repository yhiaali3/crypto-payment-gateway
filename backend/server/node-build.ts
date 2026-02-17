import path from "path";
import { createServer } from "./index";
import * as express from "express";
import { config } from "./config/env";
import { logger } from "./utils/logger";

const app = createServer();
const port = config.PORT;
const host = config.HOST;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, host, () => {
  logger.info(`Server running`, { host, port });
  logger.info(`Frontend available`, { url: `http://${host}:${port}` });
  logger.info(`API available`, { url: `http://${host}:${port}/api` });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
