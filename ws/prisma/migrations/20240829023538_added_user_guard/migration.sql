/*
  Warnings:

  - Added the required column `addedById` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "addedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
