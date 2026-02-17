import { Router } from "express";
import { logWebhookData, getWebhooksForMerchant } from "../services/webhook";
import { logger } from "../utils/logger";
import { jwtAuth, AuthenticatedRequest } from "../middlewares/auth";

const router = Router();

/**
 * GET /api/webhooks/my
 * Returns webhook logs for authenticated merchant (JWT)
 */
const handleGetMyWebhooks = async (req: AuthenticatedRequest, res: any) => {
  try {
    if (!req.merchantId) return res.status(401).json({ error: 'Unauthorized' });

    const logs = await getWebhooksForMerchant(req.merchantId);

    const response = logs.map((l) => ({
      id: l.id,
      paymentId: l.paymentId,
      merchantId: l.merchantId,
      payload: l.payload,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));

    res.json(response);
  } catch (err) {
    logger.error('Get my webhooks error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
};

router.get('/my', jwtAuth, handleGetMyWebhooks);

router.post("/payment", async (req, res) => {
  try {
    const data = req.body;

    await logWebhookData(data);

    logger.info("Webhook received", { paymentId: data.paymentId });

    res.json({ success: true });
  } catch (error) {
    logger.error("Webhook handler failed", { error: String(error) });
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
