export interface PaymentItem {
    id: string
    merchantId: string
    amount: number
    currency: string
    network: string
    paymentMethod: string
    customerReference: string
    status: string
    paymentAddress: string
    paymentLink: string
    txHash?: string
    expiresAt: string
    confirmedAt?: string
    amountReceived?: number
    createdAt: string
    updatedAt: string
}
