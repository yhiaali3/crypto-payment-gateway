import { createServer } from "./index";
import { logger } from "./utils/logger";
import { config } from "./config/env";

// Validate critical env vars before starting in production
function validateRequiredEnv() {
  if (config.NODE_ENV === "production") {
    const required = ["JWT_SECRET", "API_KEY_SECRET", "WEBHOOK_SECRET", "DATABASE_URL"];
    const missing = required.filter((k) => !process.env[k] || process.env[k]?.includes("dev-"));
    if (missing.length) {
      throw new Error(`Missing or insecure environment variables in production: ${missing.join(", ")}`);
    }
  }
}

validateRequiredEnv();

const app = createServer();
const port = config.PORT;
const host = config.HOST;

const server = app.listen(port, host, () => {
  logger.info(`Server running`, { host, port });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
