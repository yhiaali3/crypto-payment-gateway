/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

import { config } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel =
  LOG_LEVELS[config.LOG_LEVEL as LogLevel] || LOG_LEVELS.info;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLogLevel;
}

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (shouldLog("debug")) {
      console.log(formatLog("debug", message, data));
    }
  },

  info(message: string, data?: unknown) {
    if (shouldLog("info")) {
      console.log(formatLog("info", message, data));
    }
  },

  warn(message: string, data?: unknown) {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, data));
    }
  },

  error(message: string, data?: unknown) {
    if (shouldLog("error")) {
      console.error(formatLog("error", message, data));
    }
  },
};
