# CLAUDE.md
## Important!
- All env variables are outside of the project directory.  This is detailed in the README file.  Do not forget this.  If new env variables are needed update the README file and bring to my attention.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Job Tracker Application that helps streamline job applications by automatically generating customized resumes and cover letter outlines using AI. The application tracks the entire job application lifecycle from discovery to closure.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router and TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (GPT-3.5/GPT-4)
- **Extension**: Chrome Extension (Manifest V3)

### Core Components
```
├── Frontend (React/Next.js)
│   ├── Dashboard (job listing and management)
│   ├── Configuration (settings and AI prompts)
│   ├── Job Details (individual job view)
│   └── Chrome Extension Integration
├── Backend (Next.js API Routes)
│   ├── Job CRUD operations
│   ├── AI Integration (4 services)
│   ├── Configuration management
│   └── Chrome Extension API
└── Data Layer (Prisma + SQLite)
    ├── Jobs table with full lifecycle tracking
    └── Configuration storage
```

## Database Schema

### Jobs Table
- `id`, `creationDate`, `jobDescriptionUrl`, `jobDescription`
- `status` (pending, applied, closed, rejected, did_not_apply)
- `companyName`, `title`, `salaryRange`, `providedSalaryRange`
- `jobInfo` (JSON for company information)
- `jobResume`, `coverLetterOutline`
- `appliedDate`, `closedDate`

### Configuration Table
- `sourceResume`, AI prompt templates for 2 services
- Model selection for OpenAI API

## AI Integration

The application uses a streamlined 2-service AI architecture:
1. **Job Analysis & Resume Customization**: Analyzes job posting, extracts company details (name, title, salary, background), and generates customized resume in a single service call
2. **Cover Letter Outline**: Generates structured outline using company information from the first service

## API Endpoints

### Job Management
- `GET/POST /api/jobs` - List/create jobs
- `GET/PUT/DELETE /api/jobs/[id]` - Individual job operations

### AI Services
- `POST /api/ai?service=job-analysis` - Job analysis, data extraction, and resume customization
- `POST /api/ai?service=cover-letter` - Cover letter outline generation

### Configuration
- `GET/PUT /api/config` - Configuration management

### Chrome Extension
- `POST /api/extension/add-job` - Add job from extension

## Development Commands

*Note: This project is in planning phase. Once implemented, typical Next.js commands would be:*
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations

## Key Features

### Job Application Workflow
1. Chrome extension captures job URL
2. AI automatically processes job description
3. System extracts company info, job details
4. Generates customized resume and cover letter outline
5. User manages application status through 5 states
6. Salary prompt when marking as "Applied"

### Chrome Extension
- One-click job capture from any job posting page
- Automatic URL detection and content extraction
- Background processing with main application

## Security Considerations
- Encrypted API key storage
- CORS configuration for extension
- Input validation for all AI outputs
- Rate limiting for API protection

## Simplicity Guidelines

As per user instructions, always prioritize simplicity:
- Make minimal necessary changes
- Impact as little code as possible
- Prefer editing existing files over creating new ones
- Avoid complex or massive changes