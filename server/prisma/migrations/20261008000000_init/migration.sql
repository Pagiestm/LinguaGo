-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LevelCode" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "SeriesType" AS ENUM ('DEFAULT', 'TALK');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'TRANSLATION', 'TRUE_FALSE', 'TALK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "pseudo" VARCHAR(40) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "firstLogin" BOOLEAN NOT NULL DEFAULT true,
    "avatarId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "svg" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "code" "LevelCode" NOT NULL,
    "position" INTEGER NOT NULL,
    "title" VARCHAR(60) NOT NULL,
    "description" TEXT NOT NULL,
    "pointsPerExercise" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "type" "SeriesType" NOT NULL DEFAULT 'DEFAULT',
    "levelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "choices" JSONB NOT NULL DEFAULT '[]',
    "type" "ExerciseType" NOT NULL,
    "seriesId" INTEGER NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "successfulExercises" INTEGER NOT NULL DEFAULT 0,
    "failedExercises" INTEGER NOT NULL DEFAULT 0,
    "completedSeries" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CompletedExercise" (
    "userId" TEXT NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "pointsWon" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedExercise_pkey" PRIMARY KEY ("userId","exerciseId")
);

-- CreateTable
CREATE TABLE "CompletedSeries" (
    "userId" TEXT NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedSeries_pkey" PRIMARY KEY ("userId","seriesId")
);

-- CreateTable
CREATE TABLE "FavoriteSeries" (
    "userId" TEXT NOT NULL,
    "seriesId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteSeries_pkey" PRIMARY KEY ("userId","seriesId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "userId" TEXT NOT NULL,
    "subscription" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "frequencyDays" INTEGER NOT NULL DEFAULT 1,
    "time" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "timeZone" VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris',
    "nextNotifyAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Level_code_key" ON "Level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Level_position_key" ON "Level"("position");

-- CreateIndex
CREATE INDEX "Series_levelId_type_idx" ON "Series"("levelId", "type");

-- CreateIndex
CREATE INDEX "Exercise_seriesId_idx" ON "Exercise"("seriesId");

-- CreateIndex
CREATE INDEX "CompletedExercise_userId_completedAt_idx" ON "CompletedExercise"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "CompletedExercise_completedAt_idx" ON "CompletedExercise"("completedAt");

-- CreateIndex
CREATE INDEX "Notification_enabled_nextNotifyAt_idx" ON "Notification"("enabled", "nextNotifyAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedExercise" ADD CONSTRAINT "CompletedExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedExercise" ADD CONSTRAINT "CompletedExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedSeries" ADD CONSTRAINT "CompletedSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedSeries" ADD CONSTRAINT "CompletedSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSeries" ADD CONSTRAINT "FavoriteSeries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSeries" ADD CONSTRAINT "FavoriteSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

