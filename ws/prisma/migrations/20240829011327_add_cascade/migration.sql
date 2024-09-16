-- DropForeignKey
ALTER TABLE "Upvote" DROP CONSTRAINT "Upvote_streamId_fkey";

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
