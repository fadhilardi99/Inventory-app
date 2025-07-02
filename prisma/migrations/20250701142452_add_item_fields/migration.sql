/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");
