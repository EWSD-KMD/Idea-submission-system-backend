-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Operation" ADD VALUE 'EXPORT';
ALTER TYPE "Operation" ADD VALUE 'HIDE';
ALTER TYPE "Operation" ADD VALUE 'DISABLE';
ALTER TYPE "Operation" ADD VALUE 'FULLY_DISABLE';
ALTER TYPE "Operation" ADD VALUE 'ENABLE';
