/**
 * Request Validation Middleware
 * Uses Zod for schema validation
 */

import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.query = result.data as any;
    next();
  };
}

export function validateParams(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.params = result.data as any;
    next();
  };
}
