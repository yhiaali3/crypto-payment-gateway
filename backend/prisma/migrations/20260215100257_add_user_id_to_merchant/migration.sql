/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "userId" TEXT;

