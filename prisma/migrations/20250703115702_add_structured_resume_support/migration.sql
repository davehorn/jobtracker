/*
  Warnings:

  - You are about to drop the column `companyInfoPrompt` on the `configurations` table. All the data in the column will be lost.
  - You are about to drop the column `jobExtractionPrompt` on the `configurations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceResume" TEXT NOT NULL,
    "resumePrompt" TEXT NOT NULL,
    "coverLetterPrompt" TEXT NOT NULL,
    "selectedModel" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "resumeFormat" TEXT NOT NULL DEFAULT 'text',
    "structuredResume" TEXT
);
INSERT INTO "new_configurations" ("coverLetterPrompt", "id", "resumePrompt", "selectedModel", "sourceResume") SELECT "coverLetterPrompt", "id", "resumePrompt", "selectedModel", "sourceResume" FROM "configurations";
DROP TABLE "configurations";
ALTER TABLE "new_configurations" RENAME TO "configurations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
