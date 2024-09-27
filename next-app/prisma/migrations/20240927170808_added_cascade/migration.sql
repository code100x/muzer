-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'Credentials';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT;
