import { Request, Response } from 'express';
import { updatePaymentStatus, logWebhook } from '../services/payment';
import { logger } from '../server/utils/logger';

const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const { paymentId, status, txHash, amountReceived, timestamp } = req.body;

    // Add validation logic for webhook data
    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing paymentId' });
    }
    if (typeof status !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing status' });
    }
    if (txHash && typeof txHash !== 'string') {
      return res.status(400).json({ error: 'Invalid txHash' });
    }
    if (amountReceived && typeof amountReceived !== 'number') {
      return res.status(400).json({ error: 'Invalid amountReceived' });
    }
    if (isNaN(new Date(timestamp).getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp' });
    }

    // Update payment status in the database
    const updatedPayment = await updatePaymentStatus(paymentId, {
      status,
      txHash,
      amountReceived,
      updatedAt: new Date(timestamp),
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Log the webhook
    await logWebhook({
      paymentId,
      status,
      responseCode: 200,
      responseBody: JSON.stringify(req.body),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    logger.error('Error processing webhook', { error: String(error) });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handlePaymentWebhook;