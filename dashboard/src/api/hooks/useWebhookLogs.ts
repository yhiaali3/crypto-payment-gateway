import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

const useWebhookLogs = (paymentId?: string) => {
  return useQuery(['webhookLogs', paymentId], async () => {
    if (!paymentId) throw new Error('Payment ID is required');

    const response = await apiClient.get(`/payments/${paymentId}/webhooks`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    });

    return response.data;
  });
};

export default useWebhookLogs;