-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "academicYearId" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
