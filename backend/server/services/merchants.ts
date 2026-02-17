import prisma from '../utils/prisma';

export async function createMerchant(data: any) {
  return await prisma.merchant.create({ data });
}

export async function getMerchantById(id: string) {
  return await prisma.merchant.findUnique({ where: { id } });
}

export async function getMerchantByEmail(email: string) {
  return await prisma.merchant.findUnique({ where: { email } });
}
