-- CreateTable
CREATE TABLE "LeagueRotation" (
    "week" TIMESTAMP(3) NOT NULL,
    "promoted" INTEGER NOT NULL DEFAULT 0,
    "relegated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueRotation_pkey" PRIMARY KEY ("week")
);
