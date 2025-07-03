-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobDescriptionUrl" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "companyName" TEXT,
    "title" TEXT,
    "salaryRange" TEXT,
    "providedSalaryRange" TEXT,
    "jobInfo" TEXT,
    "jobResume" TEXT,
    "coverLetterOutline" TEXT,
    "appliedDate" DATETIME,
    "closedDate" DATETIME
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceResume" TEXT NOT NULL,
    "resumePrompt" TEXT NOT NULL,
    "coverLetterPrompt" TEXT NOT NULL,
    "companyInfoPrompt" TEXT NOT NULL,
    "jobExtractionPrompt" TEXT NOT NULL,
    "openaiApiKey" TEXT
);
