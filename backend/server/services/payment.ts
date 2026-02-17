/**
 * Payment Service (Prisma-backed)
 * Handles all payment-related business logic using Prisma
 */

import { randomUUID } from "crypto";
import prisma from "../utils/prisma";
import { Payment } from "../models/types";
import {
  generatePaymentId,
  generatePaymentAddress,
  generateHmacSignature,
} from "../utils/crypto";
import { logger } from "../utils/logger";
import {
  CreatePaymentRequest,
} from "@shared/api";
import { config } from "../config/env";

export class PaymentService {
  /**
   * Create a new payment request
   */
  static async createPayment(merchantId: string, req: CreatePaymentRequest): Promise<Payment> {
    try {
      const paymentId = generatePaymentId();
      const paymentAddress = generatePaymentAddress();
      const expiresAt = new Date(Date.now() + config.PAYMENT_TIMEOUT);

      const created = await prisma.payment.create({
        data: {
          id: paymentId,
          merchantId,
          amount: req.amount,
          currency: req.currency as any,
          network: req.network as any,
          paymentMethod: req.paymentMethod as any,
          customerReference: req.customerReference,
          status: "pending",
          paymentAddress,
          paymentLink: `https://payment.gateway/checkout/${paymentId}`,
          expiresAt,
          callbackUrl: req.callbackUrl,
          description: req.description,
          metadata: (req.metadata as any) ?? undefined,
        },
      });

      logger.info("Payment created", {
        paymentId: created.id,
        merchantId,
        amount: created.amount,
        currency: created.currency,
      });

      return {
        id: created.id,
        merchantId: created.merchantId,
        amount: created.amount,
        currency: created.currency as any,
        network: created.network as any,
        paymentMethod: created.paymentMethod as any,
        customerReference: created.customerReference,
        status: created.status as any,
        paymentAddress: created.paymentAddress,
        paymentLink: created.paymentLink,
        txHash: created.txHash ?? undefined,
        expiresAt: created.expiresAt,
        confirmedAt: created.confirmedAt ?? undefined,
        amountReceived: created.amountReceived ?? undefined,
        callbackUrl: created.callbackUrl ?? undefined,
        description: created.description ?? undefined,
        metadata: (created.metadata as any) ?? undefined,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      logger.error("createPayment error", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId: string): Promise<Payment | null> {
    const p = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!p) return null;
    return {
      id: p.id,
      merchantId: p.merchantId,
      amount: p.amount,
      currency: p.currency as any,
      network: p.network as any,
      paymentMethod: p.paymentMethod as any,
      customerReference: p.customerReference,
      status: p.status as any,
      paymentAddress: p.paymentAddress,
      paymentLink: p.paymentLink,
      txHash: p.txHash ?? undefined,
      expiresAt: p.expiresAt,
      confirmedAt: p.confirmedAt ?? undefined,
      amountReceived: p.amountReceived ?? undefined,
      callbackUrl: p.callbackUrl ?? undefined,
      description: p.description ?? undefined,
      metadata: (p.metadata as any) ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  /**
   * Get all payments for a merchant
   */
  static async getMerchantPayments(merchantId: string): Promise<Payment[]> {
    const rows = await prisma.payment.findMany({ where: { merchantId } });
    return rows.map((p) => ({
      id: p.id,
      merchantId: p.merchantId,
      amount: p.amount,
      currency: p.currency as any,
      network: p.network as any,
      paymentMethod: p.paymentMethod as any,
      customerReference: p.customerReference,
      status: p.status as any,
      paymentAddress: p.paymentAddress,
      paymentLink: p.paymentLink,
      txHash: p.txHash ?? undefined,
      expiresAt: p.expiresAt,
      confirmedAt: p.confirmedAt ?? undefined,
      amountReceived: p.amountReceived ?? undefined,
      callbackUrl: p.callbackUrl ?? undefined,
      description: p.description ?? undefined,
      metadata: (p.metadata as any) ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Confirm a payment
   */
  static async confirmPayment(
    paymentId: string,
    txHash: string,
    amountReceived?: number,
  ): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return null;

    if (payment.status !== "pending") {
      logger.warn("Payment confirmation on non-pending payment", { paymentId });
      throw new Error("Payment is not in pending status");
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "confirmed",
        txHash,
        amountReceived: amountReceived ?? payment.amount,
        confirmedAt: new Date(),
      },
    });

    logger.info("Payment confirmed", { paymentId, txHash });

    if (updated) {
      // trigger webhook asynchronously
      this.triggerWebhook({
        id: updated.id,
        merchantId: updated.merchantId,
        amount: updated.amount,
        currency: updated.currency as any,
        network: updated.network as any,
        paymentMethod: updated.paymentMethod as any,
        customerReference: updated.customerReference,
        status: updated.status as any,
        paymentAddress: updated.paymentAddress,
        paymentLink: updated.paymentLink,
        txHash: updated.txHash ?? undefined,
        expiresAt: updated.expiresAt,
        confirmedAt: updated.confirmedAt ?? undefined,
        amountReceived: updated.amountReceived ?? undefined,
        callbackUrl: updated.callbackUrl ?? undefined,
        description: updated.description ?? undefined,
        metadata: (updated.metadata as any) ?? undefined,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      } as Payment);
    }

    return {
      id: updated.id,
      merchantId: updated.merchantId,
      amount: updated.amount,
      currency: updated.currency as any,
      network: updated.network as any,
      paymentMethod: updated.paymentMethod as any,
      customerReference: updated.customerReference,
      status: updated.status as any,
      paymentAddress: updated.paymentAddress,
      paymentLink: updated.paymentLink,
      txHash: updated.txHash ?? undefined,
      expiresAt: updated.expiresAt,
      confirmedAt: updated.confirmedAt ?? undefined,
      amountReceived: updated.amountReceived ?? undefined,
      callbackUrl: updated.callbackUrl ?? undefined,
      description: updated.description ?? undefined,
      metadata: (updated.metadata as any) ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Mark payment as failed
   */
  static async failPayment(paymentId: string, reason?: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return null;

    const updated = await prisma.payment.update({ where: { id: paymentId }, data: { status: "failed" } });

    logger.warn("Payment failed", { paymentId, reason });

    if (updated) {
      this.triggerWebhook({
        id: updated.id,
        merchantId: updated.merchantId,
        amount: updated.amount,
        currency: updated.currency as any,
        network: updated.network as any,
        paymentMethod: updated.paymentMethod as any,
        customerReference: updated.customerReference,
        status: updated.status as any,
        paymentAddress: updated.paymentAddress,
        paymentLink: updated.paymentLink,
        txHash: updated.txHash ?? undefined,
        expiresAt: updated.expiresAt,
        confirmedAt: updated.confirmedAt ?? undefined,
        amountReceived: updated.amountReceived ?? undefined,
        callbackUrl: updated.callbackUrl ?? undefined,
        description: updated.description ?? undefined,
        metadata: (updated.metadata as any) ?? undefined,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      } as Payment);
    }

    return {
      id: updated.id,
      merchantId: updated.merchantId,
      amount: updated.amount,
      currency: updated.currency as any,
      network: updated.network as any,
      paymentMethod: updated.paymentMethod as any,
      customerReference: updated.customerReference,
      status: updated.status as any,
      paymentAddress: updated.paymentAddress,
      paymentLink: updated.paymentLink,
      txHash: updated.txHash ?? undefined,
      expiresAt: updated.expiresAt,
      confirmedAt: updated.confirmedAt ?? undefined,
      amountReceived: updated.amountReceived ?? undefined,
      callbackUrl: updated.callbackUrl ?? undefined,
      description: updated.description ?? undefined,
      metadata: (updated.metadata as any) ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Check for expired payments and mark them
   */
  static async processExpiredPayments(): Promise<void> {
    const now = new Date();
    const payments = await prisma.payment.findMany({ where: { status: "pending", expiresAt: { lt: now } } });
    for (const payment of payments) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "expired" } });
      logger.info("Payment expired", { paymentId: payment.id, merchantId: payment.merchantId });
    }
  }

  /**
   * Trigger webhook for payment status change
   */
  private static async triggerWebhook(payment: Payment): Promise<void> {
    const merchant = await prisma.merchant.findUnique({ where: { id: payment.merchantId } });
    if (!merchant || !merchant.webhookUrl) return;

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
    const signature = generateHmacSignature(payloadString, config.WEBHOOK_SECRET);

    const signedPayload = { ...payload, signature };

    this.sendWebhookAsync(merchant.webhookUrl, signedPayload, payment.id, payment.merchantId);
  }

  /**
   * Send webhook asynchronously
   */
  private static sendWebhookAsync(url: string, payload: unknown, paymentId: string, merchantId: string): void {
    setImmediate(() => { this.sendWebhookWithRetries(url, payload, paymentId, merchantId, 0); });
  }

  /**
   * Send webhook with retry logic
   */
  private static async sendWebhookWithRetries(url: string, payload: unknown, paymentId: string, merchantId: string, attempt: number): Promise<void> {
    try {
      // create initial webhook log
      const log = await prisma.webhookLog.create({ data: {
        id: randomUUID(),
        paymentId,
        merchantId,
        url,
        payload: payload as any,
        status: 0,
        retries: attempt,
      }});

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let resBody: any = null;
      try { resBody = await response.json(); } catch { resBody = await response.text(); }

      logger.info("Webhook sent", { paymentId, merchantId, status: response.status });

      await prisma.webhookLog.update({ where: { id: log.id }, data: { status: response.status, response: typeof resBody === 'string' ? resBody : resBody } });
    } catch (error) {
      if (attempt < config.WEBHOOK_RETRY_ATTEMPTS) {
        logger.warn("Webhook send failed, retrying", { paymentId, attempt, error: String(error) });
        setTimeout(() => { this.sendWebhookWithRetries(url, payload, paymentId, merchantId, attempt + 1); }, config.WEBHOOK_RETRY_DELAY * (attempt + 1));
      } else {
        logger.error("Webhook send failed after retries", { paymentId, merchantId, error: String(error) });
        try {
          await prisma.webhookLog.create({ data: {
            id: randomUUID(),
            paymentId,
            merchantId,
            url,
            payload: payload as any,
            status: 0,
            retries: attempt + 1,
            nextRetryAt: null,
          }});
        } catch (e) { logger.error('Failed to persist failing webhook log', e); }
      }
    }
  }
}

// note: webhook logging helper moved to services/webhook.ts
