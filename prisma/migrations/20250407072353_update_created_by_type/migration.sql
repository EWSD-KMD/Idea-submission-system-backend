/*
  Warnings:

  - Changed the type of `createdBy` on the `IdeaFile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "IdeaFile" DROP COLUMN "createdBy",
ADD COLUMN     "createdBy" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IdeaFile_createdBy_key" ON "IdeaFile"("createdBy");
