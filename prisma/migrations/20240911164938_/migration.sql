/*
  Warnings:

  - The primary key for the `CurrentStream` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CurrentStream" DROP CONSTRAINT "CurrentStream_pkey",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(), -- Use UUID auto-generation
ADD CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id");