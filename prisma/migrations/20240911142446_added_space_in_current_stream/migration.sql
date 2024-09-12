/*
  Warnings:

  - A unique constraint covering the columns `[spaceId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CurrentStream" ADD COLUMN     "spaceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
