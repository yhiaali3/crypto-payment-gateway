/**
 * Payment API Routes
 * Handles payment creation, status checking, and webhook management
 */

import { Router, RequestHandler } from "express";
import { z } from "zod";
import { PaymentService } from "../services/payment";
import { validateBody } from "../middlewares/validation";
import { apiKeyAuth, AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import { verifyHmacSignature, generateHmacSignature } from "../utils/crypto";
import { config } from "../config/env";
import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  WebhookPayload,
} from "@shared/api";

const router = Router();

// ============================================================================
// Validation Schemas
// ============================================================================

const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.enum(["USDT", "BNB", "ETH", "BTC"]),
  network: z.enum(["TRC20", "BSC", "ERC20", "BITCOIN"]),
  paymentMethod: z.enum(["binance_pay", "usdt_trc20", "crypto_wallet"]),
  customerReference: z.string().min(1, "Customer reference is required"),
  callbackUrl: z.string().url().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/payments
 * Create a new payment request
 * Requires: API Key authentication
 */
const handleCreatePayment: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const data = req.body as CreatePaymentRequest;

    const payment = PaymentService.createPayment(req.merchantId, data);

    const response: PaymentResponse = {
      id: payment.id,
      merchantId: payment.merchantId,
      amount: payment.amount,
      currency: payment.currency,
      network: payment.network,
      paymentMethod: payment.paymentMethod,
      customerReference: payment.customerReference,
      status: payment.status,
      paymentAddress: payment.paymentAddress,
      paymentLink: payment.paymentLink,
      expiresAt: payment.expiresAt.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };

    logger.info("Payment created via API", {
      paymentId: payment.id,
      merchantId: req.merchantId,
      amount: payment.amount,
    });

    res.status(201).json(response);
  } catch (error) {
    logger.error("Create payment error", { error: String(error) });

    res.status(500).json({
      error: "Failed to create payment",
      code: "PAYMENT_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * GET /api/payments/:paymentId
 * Get payment status
 * Requires: API Key authentication
 */
const handleGetPaymentStatus: RequestHandler = (
  req: AuthenticatedRequest,
  res,
) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const { paymentId } = req.params;

    const payment = PaymentService.getPayment(paymentId);

    if (!payment) {
      return res.status(404).json({
        error: "Payment not found",
        code: "NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    }

    // Verify merchant owns this payment
    if (payment.merchantId !== req.merchantId) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
        timestamp: new Date().toISOString(),
      });
    }

    const response: PaymentStatusResponse = {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      amountReceived: payment.amountReceived,
      currency: payment.currency,
      txHash: payment.txHash,
      confirmedAt: payment.confirmedAt?.toISOString(),
      expiresAt: payment.expiresAt.toISOString(),
      network: payment.network,
    };

    res.json(response);
  } catch (error) {
    logger.error("Get payment status error", { error: String(error) });

    res.status(500).json({
      error: "Failed to get payment status",
      code: "STATUS_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * GET /api/payments
 * List merchant's payments
 * Requires: API Key authentication
 */
const handleListPayments: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const payments = PaymentService.getMerchantPayments(req.merchantId);

    const response: PaymentResponse[] = payments.map((payment) => ({
      id: payment.id,
      merchantId: payment.merchantId,
      amount: payment.amount,
      currency: payment.currency,
      network: payment.network,
      paymentMethod: payment.paymentMethod,
      customerReference: payment.customerReference,
      status: payment.status,
      paymentAddress: payment.paymentAddress,
      paymentLink: payment.paymentLink,
      txHash: payment.txHash,
      expiresAt: payment.expiresAt.toISOString(),
      confirmedAt: payment.confirmedAt?.toISOString(),
      amountReceived: payment.amountReceived,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    }));

    res.json(response);
  } catch (error) {
    logger.error("List payments error", { error: String(error) });

    res.status(500).json({
      error: "Failed to list payments",
      code: "LIST_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * POST /api/webhooks/verify
 * Verify webhook signature
 * Public endpoint - used for testing webhook signature verification
 */
const handleVerifyWebhook: RequestHandler = (req, res) => {
  try {
    const { payload, signature } = req.body;

    if (!payload || !signature) {
      return res.status(400).json({
        error: "Missing payload or signature",
        code: "VALIDATION_ERROR",
        timestamp: new Date().toISOString(),
      });
    }

    const payloadString =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    const isValid = verifyHmacSignature(
      payloadString,
      signature,
      config.WEBHOOK_SECRET,
    );

    res.json({
      isValid,
      message: isValid ? "Signature is valid" : "Signature is invalid",
    });
  } catch (error) {
    logger.error("Webhook verification error", { error: String(error) });

    res.status(500).json({
      error: "Failed to verify webhook",
      code: "VERIFICATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * POST /api/webhooks/test
 * Generate test webhook payload with signature
 * For testing webhook integration
 */
const handleTestWebhook: RequestHandler = (req: AuthenticatedRequest, res) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const testPayload = {
      paymentId: "pay_test_" + Date.now(),
      merchantId: req.merchantId,
      status: "confirmed",
      amount: 100,
      amountReceived: 100,
      currency: "USDT",
      txHash: "0x" + "a".repeat(64),
      confirmedAt: new Date().toISOString(),
      customerReference: "test_customer_001",
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = generateHmacSignature(
      payloadString,
      config.WEBHOOK_SECRET,
    );

    const webhookPayload: WebhookPayload = {
      ...testPayload,
      signature,
    };

    logger.info("Test webhook generated", { merchantId: req.merchantId });

    res.json(webhookPayload);
  } catch (error) {
    logger.error("Test webhook error", { error: String(error) });

    res.status(500).json({
      error: "Failed to generate test webhook",
      code: "TEST_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

// ============================================================================
// Route Setup
// ============================================================================

router.post(
  "/",
  apiKeyAuth,
  validateBody(createPaymentSchema),
  handleCreatePayment,
);
router.get("/", apiKeyAuth, handleListPayments);
router.get("/:paymentId", apiKeyAuth, handleGetPaymentStatus);
router.post("/webhooks/verify", handleVerifyWebhook);
router.post("/webhooks/test", handleTestWebhook);

export default router;
