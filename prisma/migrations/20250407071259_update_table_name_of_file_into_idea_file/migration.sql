/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_ideaId_fkey";

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "IdeaFile" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "ideaId" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdeaFile_createdBy_key" ON "IdeaFile"("createdBy");

-- AddForeignKey
ALTER TABLE "IdeaFile" ADD CONSTRAINT "IdeaFile_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
