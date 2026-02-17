import prisma from '../server/utils/prisma';

export const updatePaymentStatus = async (
  paymentId: string,
  updateData: {
    status: string;
    txHash?: string;
    amountReceived?: number;
    updatedAt: Date;
  }
) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return null;

    const updated = await prisma.payment.update({ where: { id: paymentId }, data: updateData });
    return updated;
  } catch (error) {
    // record in structured logger; do not leak stack to responses here
    await import('../server/utils/logger').then(m => m.logger.error('Error updating payment status', { error: String(error) }));
    throw error;
  }
};

export const logWebhook = async (logData: {
  paymentId: string;
  status: string | number;
  responseCode: number;
  responseBody: string;
  createdAt: Date;
  updatedAt: Date;
}) => {
  try {
    await prisma.webhookLog.create({
      data: {
        id: logData.paymentId + '_' + Date.now().toString(),
        paymentId: logData.paymentId,
        merchantId: 'unknown',
        url: '',
        payload: logData.responseBody,
        status: Number(logData.status) || logData.responseCode || 0,
      },
    });
  } catch (error) {
    await import('../server/utils/logger').then(m => m.logger.error('Error logging webhook', { error: String(error) }));
    throw error;
  }
};