-- CreateTable
CREATE TABLE "MasterSetting" (
    "id" SERIAL NOT NULL,
    "currentAcademicYearId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterSetting_pkey" PRIMARY KEY ("id")
);
