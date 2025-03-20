-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'SHOW';

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "closureDate" TIMESTAMP(3) NOT NULL,
    "finalClosureDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'SHOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);
