-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "lastCommentAt" DROP NOT NULL,
ALTER COLUMN "lastCommentAt" DROP DEFAULT;
