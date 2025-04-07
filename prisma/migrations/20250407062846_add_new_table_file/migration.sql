/*
  Warnings:

  - The values [EXPORT,HIDE,DISABLE,FULLY_DISABLE,ENABLE] on the enum `Operation` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Operation_new" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE');
ALTER TABLE "Permission" ALTER COLUMN "operation" TYPE "Operation_new" USING ("operation"::text::"Operation_new");
ALTER TYPE "Operation" RENAME TO "Operation_old";
ALTER TYPE "Operation_new" RENAME TO "Operation";
DROP TYPE "Operation_old";
COMMIT;

-- CreateTable
CREATE TABLE "File" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_createdBy_key" ON "File"("createdBy");
