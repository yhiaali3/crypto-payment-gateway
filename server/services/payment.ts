/**
 * Payment Service
 * Handles all payment-related business logic
 */

import { db } from "../models/database";
import { Payment } from "../models/types";
import {
  generatePaymentId,
  generatePaymentAddress,
  generateHmacSignature,
} from "../utils/crypto";
import { logger } from "../utils/logger";
import {
  PaymentCurrency,
  PaymentNetwork,
  PaymentMethod,
  PaymentStatus,
  CreatePaymentRequest,
} from "@shared/api";
import { config } from "../config/env";

export class PaymentService {
  /**
   * Create a new payment request
   */
  static createPayment(merchantId: string, req: CreatePaymentRequest): Payment {
    const paymentId = generatePaymentId();
    const paymentAddress = generatePaymentAddress();
    const expiresAt = new Date(Date.now() + config.PAYMENT_TIMEOUT);

    const payment: Payment = {
      id: paymentId,
      merchantId,
      amount: req.amount,
      currency: req.currency,
      network: req.network,
      paymentMethod: req.paymentMethod,
      customerReference: req.customerReference,
      status: "pending",
      paymentAddress,
      paymentLink: `https://payment.gateway/checkout/${paymentId}`,
      expiresAt,
      callbackUrl: req.callbackUrl,
      description: req.description,
      metadata: req.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.savePayment(payment);
    logger.info("Payment created", {
      paymentId,
      merchantId,
      amount: req.amount,
      currency: req.currency,
    });

    return payment;
  }

  /**
   * Get payment by ID
   */
  static getPayment(paymentId: string): Payment | null {
    const payment = db.getPayment(paymentId);
    return payment || null;
  }

  /**
   * Get all payments for a merchant
   */
  static getMerchantPayments(merchantId: string): Payment[] {
    return db.getPaymentsByMerchant(merchantId);
  }

  /**
   * Confirm a payment
   */
  static confirmPayment(
    paymentId: string,
    txHash: string,
    amountReceived?: number,
  ): Payment | null {
    const payment = db.getPayment(paymentId);
    if (!payment) {
      return null;
    }

    if (payment.status !== "pending") {
      logger.warn("Payment confirmation on non-pending payment", { paymentId });
      throw new Error("Payment is not in pending status");
    }

    const updated = db.updatePayment(paymentId, {
      status: "confirmed",
      txHash,
      amountReceived: amountReceived || payment.amount,
      confirmedAt: new Date(),
    });

    logger.info("Payment confirmed", { paymentId, txHash });

    if (updated) {
      this.triggerWebhook(updated);
    }

    return updated || null;
  }

  /**
   * Mark payment as failed
   */
  static failPayment(paymentId: string, reason?: string): Payment | null {
    const payment = db.getPayment(paymentId);
    if (!payment) {
      return null;
    }

    const updated = db.updatePayment(paymentId, {
      status: "failed",
    });

    logger.warn("Payment failed", { paymentId, reason });

    if (updated) {
      this.triggerWebhook(updated);
    }

    return updated || null;
  }

  /**
   * Check for expired payments and mark them
   */
  static processExpiredPayments(): void {
    const payments = db.getAllPayments();
    const now = new Date();

    for (const payment of payments) {
      if (payment.status === "pending" && payment.expiresAt < now) {
        db.updatePayment(payment.id, {
          status: "expired",
        });

        logger.info("Payment expired", {
          paymentId: payment.id,
          merchantId: payment.merchantId,
        });
      }
    }
  }

  /**
   * Trigger webhook for payment status change
   */
  private static triggerWebhook(payment: Payment): void {
    const merchant = db.getMerchant(payment.merchantId);
    if (!merchant || !merchant.webhookUrl) {
      return;
    }

    const payload = {
      paymentId: payment.id,
      merchantId: payment.merchantId,
      status: payment.status,
      amount: payment.amount,
      amountReceived: payment.amountReceived,
      currency: payment.currency,
      txHash: payment.txHash,
      confirmedAt: payment.confirmedAt,
      customerReference: payment.customerReference,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateHmacSignature(
      payloadString,
      config.WEBHOOK_SECRET,
    );

    // Add signature to payload
    const signedPayload = {
      ...payload,
      signature,
    };

    // Send webhook asynchronously (don't wait for response)
    this.sendWebhookAsync(
      merchant.webhookUrl,
      signedPayload,
      payment.id,
      payment.merchantId,
    );
  }

  /**
   * Send webhook asynchronously
   */
  private static sendWebhookAsync(
    url: string,
    payload: unknown,
    paymentId: string,
    merchantId: string,
  ): void {
    // In production, use a queue system like Bull or RabbitMQ
    // For now, send synchronously with retries
    setImmediate(() => {
      this.sendWebhookWithRetries(url, payload, paymentId, merchantId, 0);
    });
  }

  /**
   * Send webhook with retry logic
   */
  private static async sendWebhookWithRetries(
    url: string,
    payload: unknown,
    paymentId: string,
    merchantId: string,
    attempt: number,
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      logger.info("Webhook sent", {
        paymentId,
        merchantId,
        status: response.status,
      });
    } catch (error) {
      if (attempt < config.WEBHOOK_RETRY_ATTEMPTS) {
        logger.warn("Webhook send failed, retrying", {
          paymentId,
          attempt,
          error: String(error),
        });

        setTimeout(
          () => {
            this.sendWebhookWithRetries(
              url,
              payload,
              paymentId,
              merchantId,
              attempt + 1,
            );
          },
          config.WEBHOOK_RETRY_DELAY * (attempt + 1),
        );
      } else {
        logger.error("Webhook send failed after retries", {
          paymentId,
          merchantId,
          error: String(error),
        });
      }
    }
  }
}
