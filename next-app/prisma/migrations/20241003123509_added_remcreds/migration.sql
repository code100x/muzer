-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'Credentials';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "RemainingCreds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "remainingCreds" INTEGER NOT NULL,

    CONSTRAINT "RemainingCreds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RemainingCreds_userId_spaceId_key" ON "RemainingCreds"("userId", "spaceId");

-- AddForeignKey
ALTER TABLE "RemainingCreds" ADD CONSTRAINT "RemainingCreds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemainingCreds" ADD CONSTRAINT "RemainingCreds_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
