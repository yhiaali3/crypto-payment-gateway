import prisma from '../utils/prisma';

export async function createPayment(data: any) {
  return await prisma.payment.create({ data });
}

export async function getPaymentById(id: string) {
  return await prisma.payment.findUnique({ where: { id } });
}

export async function getPaymentsByMerchant(merchantId: string) {
  return await prisma.payment.findMany({ where: { merchantId } });
}

// Alias for compatibility with Dashboard API
export async function getPaymentsForMerchant(merchantId: string) {
  return await getPaymentsByMerchant(merchantId);
}
