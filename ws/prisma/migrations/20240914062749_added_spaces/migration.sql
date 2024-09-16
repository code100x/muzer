/*
  Warnings:

  - The primary key for the `CurrentStream` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[spaceId]` on the table `CurrentStream` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `CurrentStream` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_pkey",
ADD COLUMN "id" UUID DEFAULT gen_random_uuid(),
ADD COLUMN     "spaceId" TEXT,
ADD CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Stream" ADD COLUMN     "spaceId" TEXT;

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentStream_spaceId_key" ON "CurrentStream"("spaceId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
