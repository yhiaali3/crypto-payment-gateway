import { randomUUID } from 'crypto';
import prisma from '../utils/prisma';
import { logger } from '../utils/logger';

export async function logWebhookData(data: any) {
  try {
    const entry = await prisma.webhookLog.create({
      data: {
        id: data.id ?? randomUUID(),
        paymentId: data.paymentId ?? 'unknown',
        merchantId: data.merchantId ?? 'unknown',
        url: data.url ?? data.callbackUrl ?? 'unknown',
        payload: data.payload ?? data,
        status: typeof data.status === 'number' ? data.status : (data.status ? parseInt(String(data.status)) || 0 : 0),
        response: data.response ?? null,
        retries: data.retries ?? 0,
        nextRetryAt: data.nextRetryAt ? new Date(data.nextRetryAt) : null,
      },
    });

    return entry;
  } catch (error) {
    logger.error('Failed to log webhook data', error);
    throw error;
  }
}

/**
 * Get webhook logs for a merchant
 */
export async function getWebhooksForMerchant(merchantId: string) {
  const rows = await prisma.webhookLog.findMany({ where: { merchantId }, orderBy: { createdAt: 'desc' } });
  return rows.map((r) => ({
    id: r.id,
    paymentId: r.paymentId,
    merchantId: r.merchantId,
    payload: r.payload,
    status: r.status,
    response: r.response ?? null,
    retries: r.retries,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}
