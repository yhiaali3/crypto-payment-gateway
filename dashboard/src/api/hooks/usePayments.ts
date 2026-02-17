import { useQuery } from '@tanstack/react-query'
import api from '../../api/apiClient'
import type { PaymentItem } from '../../types'

export function usePayments() {
    return useQuery<PaymentItem[], Error>(['payments'], async () => {
        try {
            const res = await api.get('/payments', {
                headers: {
                    Authorization: `ApiKey ${import.meta.env.VITE_API_KEY}`,
                },
            })

            return (res.data as PaymentItem[]) || []
        } catch (err: any) {
            const message =
                err?.message ||
                (err?.data && err.data.error) ||
                'Failed to fetch payments'
            throw new Error(message)
        }
    })
}
