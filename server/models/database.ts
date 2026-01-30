/**
 * In-Memory Database
 * Stores merchants, payments, and webhook logs
 * In production, replace with MongoDB or your preferred database
 */

import { Merchant, Payment, WebhookLog, ApiKey } from "./types";

class Database {
  private merchants: Map<string, Merchant> = new Map();
  private payments: Map<string, Payment> = new Map();
  private webhookLogs: Map<string, WebhookLog> = new Map();

  // Merchant operations
  saveMerchant(merchant: Merchant): void {
    this.merchants.set(merchant.id, { ...merchant });
  }

  getMerchant(id: string): Merchant | undefined {
    const merchant = this.merchants.get(id);
    return merchant ? { ...merchant } : undefined;
  }

  getMerchantByEmail(email: string): Merchant | undefined {
    for (const merchant of this.merchants.values()) {
      if (merchant.email === email) {
        return { ...merchant };
      }
    }
    return undefined;
  }

  getAllMerchants(): Merchant[] {
    return Array.from(this.merchants.values()).map((m) => ({ ...m }));
  }

  updateMerchant(id: string, updates: Partial<Merchant>): Merchant | undefined {
    const merchant = this.merchants.get(id);
    if (!merchant) return undefined;

    const updated = { ...merchant, ...updates, updatedAt: new Date() };
    this.merchants.set(id, updated);
    return updated;
  }

  // Payment operations
  savePayment(payment: Payment): void {
    this.payments.set(payment.id, { ...payment });
  }

  getPayment(id: string): Payment | undefined {
    const payment = this.payments.get(id);
    return payment ? { ...payment } : undefined;
  }

  getPaymentsByMerchant(merchantId: string): Payment[] {
    const payments: Payment[] = [];
    for (const payment of this.payments.values()) {
      if (payment.merchantId === merchantId) {
        payments.push({ ...payment });
      }
    }
    return payments;
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | undefined {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updated);
    return updated;
  }

  getAllPayments(): Payment[] {
    return Array.from(this.payments.values()).map((p) => ({ ...p }));
  }

  // Webhook log operations
  saveWebhookLog(log: WebhookLog): void {
    this.webhookLogs.set(log.id, { ...log });
  }

  getWebhookLog(id: string): WebhookLog | undefined {
    const log = this.webhookLogs.get(id);
    return log ? { ...log } : undefined;
  }

  getWebhookLogsByPayment(paymentId: string): WebhookLog[] {
    const logs: WebhookLog[] = [];
    for (const log of this.webhookLogs.values()) {
      if (log.paymentId === paymentId) {
        logs.push({ ...log });
      }
    }
    return logs;
  }

  updateWebhookLog(
    id: string,
    updates: Partial<WebhookLog>,
  ): WebhookLog | undefined {
    const log = this.webhookLogs.get(id);
    if (!log) return undefined;

    const updated = { ...log, ...updates, updatedAt: new Date() };
    this.webhookLogs.set(id, updated);
    return updated;
  }

  // Cleanup (for testing)
  clear(): void {
    this.merchants.clear();
    this.payments.clear();
    this.webhookLogs.clear();
  }
}

// Export singleton instance
export const db = new Database();
