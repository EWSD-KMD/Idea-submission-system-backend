/*
  Warnings:

  - Added the required column `year` to the `AcademicYear` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AcademicYear" ADD COLUMN     "year" INTEGER NOT NULL;
