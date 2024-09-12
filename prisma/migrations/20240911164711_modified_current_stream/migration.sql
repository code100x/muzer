/*
  Warnings:

  - The primary key for the `CurrentStream` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `CurrentStream` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable

ALTER TABLE "CurrentStream" DROP CONSTRAINT IF EXISTS "CurrentStream_pkey";


ALTER TABLE "CurrentStream" ADD COLUMN "id" UUID DEFAULT gen_random_uuid();


ALTER TABLE "CurrentStream" ADD CONSTRAINT "CurrentStream_pkey" PRIMARY KEY ("id");

