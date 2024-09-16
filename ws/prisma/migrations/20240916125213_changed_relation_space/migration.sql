/*
  Warnings:

  - You are about to drop the column `currentStreamUserId` on the `Space` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_currentStreamUserId_fkey";

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "currentStreamUserId",
ADD COLUMN     "currentStreamId" TEXT;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_currentStreamId_fkey" FOREIGN KEY ("currentStreamId") REFERENCES "CurrentStream"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
