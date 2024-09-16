/*
  Warnings:

  - You are about to drop the column `currentStreamId` on the `Space` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[spaceId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,streamId,spaceId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spaceId` to the `CurrentStream` table without a default value. This is not possible if the table is not empty.
  - Made the column `streamId` on table `CurrentStream` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `streamId` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Made the column `spaceId` on table `Stream` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_streamId_fkey";

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_currentStreamId_fkey";

-- AlterTable
ALTER TABLE "CurrentStream" ADD COLUMN     "spaceId" TEXT NOT NULL,
ALTER COLUMN "streamId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "currentStreamId",
ADD COLUMN     "streamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stream" ALTER COLUMN "spaceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_userId_streamId_spaceId_key" ON "CurrentStream"("userId", "streamId", "spaceId");

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
