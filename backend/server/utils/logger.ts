/**
 * Production-ready logger (pino)
 * - Structured JSON logs
 * - Levels: debug, info, warn, error
 * - Timestamp included by pino
 */

import pino from "pino";
import { config } from "../config/env";

const pinoOptions: pino.LoggerOptions = {
  level: config.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
  base: { pid: false },
};

const pinoLogger = pino(pinoOptions);

export const logger = {
  debug(message: string, data?: unknown) {
    pinoLogger.debug(data ? { ...{ msg: message }, data } : { msg: message });
  },
  info(message: string, data?: unknown) {
    pinoLogger.info(data ? { ...{ msg: message }, data } : { msg: message });
  },
  warn(message: string, data?: unknown) {
    pinoLogger.warn(data ? { ...{ msg: message }, data } : { msg: message });
  },
  error(message: string, data?: unknown) {
    pinoLogger.error(data ? { ...{ msg: message }, data } : { msg: message });
  },
  child(opts: Record<string, unknown>) {
    return pinoLogger.child(opts);
  },
};
