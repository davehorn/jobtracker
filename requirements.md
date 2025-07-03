# Job Tracker Application Requirements

## Epic User Stories

**Epic 1: Configuration Management**
As a job seeker, I want to configure my application settings so that I can maintain my source resume and customize AI prompts for generating job-specific materials.

**Epic 2: Job Application Creation**
As a job seeker, I want to add new job opportunities through a Chrome extension so that the system can automatically generate customized resumes and cover letter outlines using AI.

**Epic 3: Job Application Tracking**
As a job seeker, I want to track the status of my job applications (Pending, Applied, Closed, Rejected, Did not Apply) so that I can manage my job search workflow effectively.

**Epic 4: Application Dashboard**
As a job seeker, I want to view and manage all my job applications in a centralized dashboard so that I can easily access resumes, cover letter outlines, and application details, as well as delete unwanted job entries.

**Epic 5: Chrome Extension Integration**
As a job seeker, I want a simple Chrome extension that captures job posting URLs so that I can quickly add new opportunities to my tracking system with minimal effort.

**Epic 6: AI-Generated Content Management**
As a job seeker, I want the system to generate and store customized resumes, cover letter outlines, company information, and extract key job details (company name, title, salary range) for each job application so that I have tailored materials ready for each opportunity.

## Core Application Features

### Configuration Section
- Source resume storage and management
- AI prompt templates for job analysis and resume customization
- AI prompt templates for cover letter outline generation

### Job Application Management
- Job creation via Chrome extension
- Job status tracking (Pending, Applied, Closed, Rejected, Did not Apply)
- Job description URL and content storage
- Job deletion capability
- Generated resume storage per job
- Cover letter outline storage per job
- Company information storage per job
- Date tracking (creation, application, closure)
- Extracted job details storage (company name, title, salary range)
- User-provided salary range (captured when marking as Applied)

### Dashboard Interface
- View all job applications
- Filter by status
- Access generated materials
- Update application status
- Delete job applications
- Salary range prompt when marking job as Applied

### Chrome Extension
- Simple URL capture from job posting pages
- One-click job addition to tracking system
- Integration with main application

## Detailed Job Application Fields

### Auto-Extracted Fields (via AI)
- **Company Name:** Extracted from job description
- **Job Title:** Extracted from job description
- **Salary Range:** Extracted from job description (if available)
- **Job Info:** Company background information
- **Job Description:** Full text content (stored locally)

### User-Managed Fields
- **Creation Date:** Automatically set when job is added
- **Job Description URL:** Source URL from Chrome extension
- **Status:** Pending, Applied, Closed, Rejected, Did not Apply
- **Provided Salary Range:** Optional field entered when marking as Applied
- **Applied Date:** Set when status changed to Applied
- **Closed Date:** Set when status changed to Closed or Rejected
- **Job Resume:** AI-generated customized resume
- **Cover Letter Outline:** AI-generated outline

## Application Workflow Updates

### Status Change to "Applied"
When a user marks a job application as "Applied":
1. Set Applied Date to current date
2. Prompt user for optional "Provided Salary Range"
3. Save the provided salary range if entered
4. Update job status to Applied

### Job Deletion
- Users can delete job applications from the dashboard
- Confirmation dialog required before deletion
- Useful for removing test entries or unwanted jobs

## AI Integration Requirements

### Two-Service AI Architecture
The system uses a streamlined 2-service approach for efficient job processing:

### Service 1: Job Analysis & Resume Customization
When processing a job description, this service must:
1. **Analyze the job posting** to extract key details
2. **Extract structured data:**
   - Company Name (official company name)
   - Job Title (specific position title)  
   - Salary Range (compensation if mentioned)
   - Company Information (background, culture, industry context)
3. **Generate customized resume** using source resume + job requirements
4. **Return structured JSON response** with all fields for database storage

### Service 2: Cover Letter Outline Generation
Using company information from Service 1, this service must:
1. **Generate personalized cover letter outline** based on job description and company context
2. **Focus on storytelling and personalization** rather than technical details
3. **Return structured outline** ready for user customization

### AI Prompt Configuration
The system supports two configurable prompts:
- **Job Analysis & Resume Prompt:** Handles job analysis, data extraction, and resume customization
- **Cover Letter Outline Prompt:** Handles cover letter outline generation using company context