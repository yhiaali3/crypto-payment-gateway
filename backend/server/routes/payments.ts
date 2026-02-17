/**
 * Payment API Routes
 * Handles payment creation, status checking, and webhook management
 */

import { Router, RequestHandler } from "express";
import { z } from "zod";
import { PaymentService } from "../services/payment";
import { validateBody } from "../middlewares/validation";
import { apiKeyAuth, jwtAuth, AuthenticatedRequest } from "../middlewares/auth";
import { logger } from "../utils/logger";
import { verifyHmacSignature, generateHmacSignature } from "../utils/crypto";
import { config } from "../config/env";
import {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  WebhookPayload,
  PaymentStatus,
  PaymentCurrency,
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
const handleCreatePayment = async (
  req: AuthenticatedRequest,
  res: any,
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

    const payment = await PaymentService.createPayment(req.merchantId, data);

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
const handleGetPaymentStatus = async (
  req: AuthenticatedRequest,
  res: any,
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
    if (typeof paymentId !== 'string') {
      return res.status(400).json({
        error: "Invalid payment ID",
        code: "INVALID_PAYMENT_ID",
        timestamp: new Date().toISOString(),
      });
    }

    const payment = await PaymentService.getPayment(paymentId);

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
const handleListPayments = async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
    }

    const payments = await PaymentService.getMerchantPayments(req.merchantId);

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
 * GET /api/payments/my
 * Returns payments for the authenticated merchant (JWT)
 */
const handleGetMyPayments = async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.merchantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payments = await PaymentService.getMerchantPayments(req.merchantId);

    // Minimal fields for dashboard
    const response = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      customerReference: p.customerReference,
      createdAt: p.createdAt.toISOString(),
      paymentLink: p.paymentLink,
    }));

    res.json(response);
  } catch (err) {
    logger.error('Get my payments error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch payments' });
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
const handleTestWebhook = (req: AuthenticatedRequest, res: any) => {
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
      status: "confirmed" as PaymentStatus,
      amount: 100,
      amountReceived: 100,
      currency: "USDT" as PaymentCurrency,
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
router.get("/my", jwtAuth, handleGetMyPayments);
router.get("/:paymentId", apiKeyAuth, handleGetPaymentStatus);
router.post("/webhooks/verify", apiKeyAuth, handleVerifyWebhook);
router.post("/webhooks/test", apiKeyAuth, handleTestWebhook);


export default router;
