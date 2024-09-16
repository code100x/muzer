/*
  Warnings:

  - You are about to drop the column `addedById` on the `Stream` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_addedById_fkey";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "addedById";
