/*
  Warnings:

  - Made the column `lastCommentAt` on table `Idea` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Idea" ALTER COLUMN "lastCommentAt" SET NOT NULL,
ALTER COLUMN "lastCommentAt" SET DEFAULT CURRENT_TIMESTAMP;
