/*
  Warnings:

  - You are about to drop the column `openaiApiKey` on the `configurations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceResume" TEXT NOT NULL,
    "resumePrompt" TEXT NOT NULL,
    "coverLetterPrompt" TEXT NOT NULL,
    "companyInfoPrompt" TEXT NOT NULL,
    "jobExtractionPrompt" TEXT NOT NULL,
    "selectedModel" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo'
);
INSERT INTO "new_configurations" ("companyInfoPrompt", "coverLetterPrompt", "id", "jobExtractionPrompt", "resumePrompt", "sourceResume") SELECT "companyInfoPrompt", "coverLetterPrompt", "id", "jobExtractionPrompt", "resumePrompt", "sourceResume" FROM "configurations";
DROP TABLE "configurations";
ALTER TABLE "new_configurations" RENAME TO "configurations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
