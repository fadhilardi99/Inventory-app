/*
  Warnings:

  - Added the required column `purpose` to the `StockOut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockOut" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purpose" TEXT NOT NULL;
