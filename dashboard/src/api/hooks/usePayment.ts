import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

const usePayment = (id?: string) => {
  return useQuery(['payment', id], async () => {
    if (!id) throw new Error('Payment ID is required');

    const response = await apiClient.get(`/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
    });

    return response.data;
  });
};

export default usePayment;