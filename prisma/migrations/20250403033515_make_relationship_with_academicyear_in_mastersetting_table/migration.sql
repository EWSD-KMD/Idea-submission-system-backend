/*
  Warnings:

  - A unique constraint covering the columns `[currentAcademicYearId]` on the table `MasterSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MasterSetting" ALTER COLUMN "currentAcademicYearId" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "MasterSetting_currentAcademicYearId_key" ON "MasterSetting"("currentAcademicYearId");

-- AddForeignKey
ALTER TABLE "MasterSetting" ADD CONSTRAINT "MasterSetting_currentAcademicYearId_fkey" FOREIGN KEY ("currentAcademicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
