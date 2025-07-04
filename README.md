# Job Tracker Application

## Overview

The Job Tracker Application is a comprehensive tool designed to streamline and optimize the job application process. It automatically generates customized resumes and cover letter outlines based on job descriptions using AI, while providing robust tracking and management capabilities for all job applications.

### Key Value Proposition
- **AI-Powered Customization**: Automatically tailors resumes to specific job requirements
- **Comprehensive Tracking**: Manages the entire application lifecycle from discovery to closure
- **Seamless Integration**: Chrome extension for effortless job capture
- **Centralized Management**: Single dashboard for all job-related materials and status tracking

## Core Functionality

### 1. Configuration Management
- **Source Resume Storage**: Master resume template that serves as the foundation for all customizations
- **AI Prompt Templates**: Customizable prompts for two AI services:
  - Job analysis and resume customization (extracts company details and customizes resume)
  - Cover letter outline generation
- **Settings Management**: Secure storage of API keys and user preferences

### 2. Job Application Lifecycle Management

#### Job Creation Process
1. **Chrome Extension Capture**: One-click URL capture from job posting pages
2. **Automatic AI Processing**: Upon capture, the system automatically:
   - Analyzes job description and extracts key details (company name, title, salary, background)
   - Creates customized resume tailored to job requirements
   - Produces cover letter outline using company context

#### Job Status Tracking
Five distinct status categories:
- **Pending**: Job added but not yet applied
- **Applied**: Application submitted
- **Did not Apply**: Decided not to pursue
- **Closed**: Position filled or opportunity expired
- **Rejected**: Explicitly rejected by employer

#### Enhanced Data Management
**Auto-Extracted Fields (AI-Powered)**:
- Company Name
- Job Title
- Salary Range (when available)
- Company Information
- Job Description Content

**User-Managed Fields**:
- Creation Date (automatic)
- Job Description URL
- Application Status
- Provided Salary Range (entered when applying)
- Applied Date
- Closed Date
- Customized Resume
- Cover Letter Outline

### 3. Dashboard Interface
- **Job Overview**: Visual grid of all applications with key information
- **Status Filtering**: Filter jobs by current status
- **Detailed Views**: Comprehensive job details with all generated materials
- **Status Management**: Easy status updates with workflow-specific prompts
- **Job Deletion**: Remove unwanted entries with confirmation dialogs

### 4. Chrome Extension Integration
- **Simple Interface**: Minimal popup with one-click job capture
- **URL Detection**: Automatic job posting URL identification
- **Background Processing**: Seamless communication with main application
- **Status Feedback**: Visual confirmation of successful job addition

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Chrome Extension│───▶│ Next.js Web App  │───▶│ OpenAI API      │
└─────────────────┘    │                  │    └─────────────────┘
                       │ ┌──────────────┐ │
                       │ │ React Frontend│ │    ┌─────────────────┐
                       │ └──────────────┘ │───▶│ SQLite Database │
                       │ ┌──────────────┐ │    │ (via Prisma)    │
                       │ │ API Routes   │ │    └─────────────────┘
                       │ └──────────────┘ │
                       └──────────────────┘
```

### Component Architecture
```
Frontend (React/Next.js)
├── Pages
│   ├── Dashboard (job listing and management)
│   ├── Configuration (settings and prompts)
│   └── Job Details (individual job view)
├── Components
│   ├── Job Cards (job display components)
│   ├── Status Selectors (status management)
│   ├── Modals (salary prompt, delete confirmation)
│   └── Forms (configuration, job editing)
└── Shared UI Components

Backend (Next.js API Routes)
├── Job Management
│   ├── CRUD operations
│   ├── Status updates
│   └── Deletion handling
├── AI Integration
│   ├── Job analysis & resume customization
│   └── Cover letter outline generation
├── Configuration Management
└── Chrome Extension API

Data Layer (Prisma + SQLite)
├── Job entities with full schema
├── Configuration storage
└── Data migrations
```

## Technical Stack

### Frontend & Backend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS for rapid UI development
- **State Management**: React hooks and Next.js built-in state

### Database & ORM
- **Database**: SQLite for simplicity and self-contained deployment
- **ORM**: Prisma for type-safe database operations
- **Migrations**: Prisma migration system

### AI Integration
- **Provider**: OpenAI API
- **Models**: GPT-3.5/GPT-4 for text generation and analysis
- **Services**: Two streamlined AI services for efficient job processing

### Browser Extension
- **Technology**: Vanilla JavaScript
- **Manifest**: Chrome Extension Manifest V3
- **Communication**: REST API calls to main application

### Development & Deployment
- **Package Manager**: npm
- **Build Tool**: Next.js built-in build system
- **Deployment**: Vercel (recommended) or self-hosted options

## Setup & Configuration

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- OpenAI API account (for AI features)

### Environment Configuration

**IMPORTANT**: For security, environment variables should be configured outside the project directory, not in a local .env file.

#### External Environment File
Create an environment file outside the project directory:

```bash
# Example: /home/username/.jobtracker-env
export DATABASE_URL="file:./dev.db"
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
export NEXTAUTH_SECRET="your-secret-key-for-sessions"
export NEXTAUTH_URL="http://localhost:3000"
```

Then source it before running the application:
```bash
source /home/username/.jobtracker-env
npm run dev
```

#### Getting Your OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Set it as your `OPENAI_API_KEY` environment variable

**Security Note**: Never commit API keys to version control. The application will read the key from your environment at runtime.

### Installation & Running

```bash
# Clone the repository
git clone <repository-url>
cd jobtracker

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Model Selection

The application supports multiple OpenAI models, configurable via the Configuration page:

- **gpt-4o** - Latest model, best performance, higher cost
- **gpt-4-turbo** - Fast and capable, good balance
- **gpt-3.5-turbo** - Most cost-effective, good for basic tasks (default)
- **gpt-4** - High quality, slower response times

Model selection is saved per user and applies to all AI features (resume customization, cover letter generation, company research, job extraction).

## Database Schema

### Jobs Table
```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jobDescriptionUrl TEXT NOT NULL,
  jobDescription TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'closed', 'rejected', 'did_not_apply')),
  companyName TEXT,
  title TEXT,
  salaryRange TEXT,
  providedSalaryRange TEXT,
  jobInfo TEXT, -- JSON string for company information
  jobResume TEXT,
  coverLetterOutline TEXT,
  appliedDate DATETIME,
  closedDate DATETIME
);
```

### Configuration Table
```sql
CREATE TABLE configurations (
  id TEXT PRIMARY KEY,
  sourceResume TEXT NOT NULL,
  resumePrompt TEXT NOT NULL,
  coverLetterPrompt TEXT NOT NULL,
  selectedModel TEXT NOT NULL DEFAULT 'gpt-3.5-turbo' -- OpenAI model selection
);
```

## API Architecture

### Job Management Endpoints
```
GET    /api/jobs              # List all jobs with filtering
POST   /api/jobs              # Create new job
GET    /api/jobs/[id]         # Get specific job
PUT    /api/jobs/[id]         # Update job (including status changes)
DELETE /api/jobs/[id]         # Delete job
```

### AI Integration Endpoints
```
POST   /api/ai?service=job-analysis   # Job analysis, data extraction, and resume customization
POST   /api/ai?service=cover-letter   # Generate cover letter outline
```

### Configuration Endpoints
```
GET    /api/config            # Get current configuration
PUT    /api/config            # Update configuration
```

### Chrome Extension Endpoints
```
POST   /api/extension/add-job # Add job from extension
GET    /api/extension/status  # Health check for extension
```

## Chrome Extension Integration

### Extension Architecture
```
Extension Popup
├── URL Detection (automatic)
├── Job Description Extraction
├── One-Click Submit Button
└── Status Feedback

Communication Flow:
1. User clicks extension icon on job posting page
2. Extension extracts URL and page content
3. Extension sends data to main app via API
4. Main app processes with AI services
5. Extension shows success confirmation
```

### Security Considerations
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **API Authentication**: Secure communication between extension and app
- **Content Security Policy**: Proper CSP headers for extension

## AI Integration Details

### Two AI Services

#### 1. Job Analysis & Resume Customization Service
- **Purpose**: Comprehensive job analysis with resume customization
- **Input**: Source resume + job description + custom prompt
- **Output**: Structured JSON response containing:
  - Company name, job title, salary range (extracted data)
  - Company background information (culture, size, industry)
  - Customized resume highlighting relevant skills and experience

#### 2. Cover Letter Outline Service  
- **Purpose**: Generate structured outline for cover letter
- **Input**: Job description + company info (from Service 1) + custom prompt
- **Output**: Bullet-point outline for personalized cover letter writing

### AI Error Handling
- **Rate Limiting**: Respect OpenAI API limits
- **Retry Logic**: Automatic retry for transient failures
- **Fallback Strategies**: Graceful degradation when AI services fail
- **Cost Monitoring**: Track and limit API usage

## Development Phases

### Phase 1: Foundation (2-3 days)
- Next.js project setup with TypeScript
- Database schema implementation with Prisma
- Basic project structure and configuration

### Phase 2: Configuration Management (2-3 days)
- Configuration UI and API endpoints
- AI prompt template management
- Settings persistence and validation

### Phase 3: Core Job Management (4-5 days)
- Job CRUD operations with new fields
- Dashboard UI with enhanced display
- Status management including new "Did not Apply" status
- Job deletion with confirmation dialogs
- Salary prompt modal for "Applied" status

### Phase 4: AI Integration (4-5 days)
- Implementation of streamlined two AI services
- Integration with job creation workflow
- Error handling and retry logic
- AI cost monitoring and limits

### Phase 5: Chrome Extension (2-3 days)
- Extension development and testing
- Integration with main application
- Cross-browser compatibility testing

### Phase 6: Polish & Production (3-4 days)
- Comprehensive testing and bug fixes
- UI/UX improvements
- Performance optimization
- Documentation and deployment preparation

## Testing Strategy

### Unit Testing
- API route testing
- AI service wrapper testing
- Database operation testing
- Utility function testing

### Integration Testing
- End-to-end job creation workflow
- AI service integration testing
- Chrome extension communication testing
- Database migration testing

### Manual Testing
- User interface functionality
- Cross-browser compatibility
- Mobile responsiveness
- Error handling scenarios

## Security Considerations

- **API Key Management**: Secure storage and encryption of OpenAI API keys
- **Input Validation**: Comprehensive validation of all user inputs and AI outputs
- **CORS Security**: Proper cross-origin request handling for extension
- **Data Privacy**: Secure handling of resume and personal information
- **Rate Limiting**: Protection against API abuse

## Deployment Options

### Recommended: Vercel
- Seamless Next.js deployment
- Automatic HTTPS and CDN
- Environment variable management
- Simple database deployment

### Self-Hosted Alternative
- VPS or cloud server deployment
- Docker containerization option
- Custom domain and SSL setup
- Manual database management

---

## Sample AI Prompts

### Job Analysis & Resume Customization Prompt

```
You are an expert job analyst and resume writer. Analyze the provided job description and customize the source resume accordingly.

CRITICAL: You must respond with valid JSON containing exactly these fields:
- companyName: Official company name (string)
- title: Job position title (string) 
- salaryRange: Compensation range if mentioned, or "Not specified" (string)
- companyInfo: Company background, culture, size, industry context (string, 2-3 sentences)
- customizedResume: Complete resume text optimized for this specific job (string)
- matchedKeywords: Array of keywords that appear in both the resume and job description (array of strings)
- unmatchedKeywords: Array of important job keywords not found in the resume (array of strings)

JSON FORMAT REQUIREMENTS:
- Use double quotes for all strings
- NO trailing commas after the last field
- Ensure proper JSON syntax that passes JSON.parse()
- Example format:
{
  "companyName": "Example Corp",
  "title": "Software Engineer",
  "salaryRange": "$80,000 - $120,000",
  "companyInfo": "Example Corp is a tech startup...",
  "customizedResume": "Complete resume text here...",
  "matchedKeywords": ["JavaScript", "React", "Node.js", "AWS"],
  "unmatchedKeywords": ["Kubernetes", "Docker", "GraphQL"]
}

ANALYSIS PROCESS:
1. Extract company name, job title, and salary information
2. Research company context from job description details
3. Identify key skills, qualifications, and requirements
4. Perform keyword matching analysis:
   - Extract technical skills, tools, technologies, and certifications from job description
   - Compare these keywords with the resume content
   - Create matchedKeywords array for skills found in both
   - Create unmatchedKeywords array for job requirements not in resume
   - Focus on technical terms, avoid generic words like "experience", "team", "work"
5. Customize the source resume by:
   - Emphasizing relevant experience and skills
   - Using keywords from the job description
   - Highlighting achievements that match the role
   - Reordering sections to prioritize relevant content
   - Maintaining professional formatting and flow

RESUME CUSTOMIZATION GUIDELINES:
- Keep the same professional structure and style
- Emphasize experiences that directly relate to the job requirements
- Use action verbs and quantifiable achievements
- Include relevant keywords naturally throughout
- Ensure the customized resume flows well and tells a compelling story

KEYWORD MATCHING GUIDELINES:
- Focus on technical skills: programming languages, frameworks, tools, software
- Include certifications, qualifications, and specific methodologies
- Extract industry-specific terms and technologies
- Identify years of experience requirements ("5+ years Python")
- Include relevant education requirements and degrees
- Avoid generic terms: "experience", "team", "communication", "leadership"
- Be thorough but precise - capture meaningful skills gaps and matches

Respond only with valid JSON - no additional text or formatting.
```

### Cover Letter Outline Prompt

```
You are an expert career coach specializing in personalized cover letters. Create a detailed outline for a cover letter based on the job description and company information provided.

REQUIREMENTS:
- Create a structured outline with clear sections
- Use bullet points for easy implementation
- Personalize based on company culture and values
- Focus on specific achievements and skills that match the role
- Keep it professional yet engaging

OUTLINE STRUCTURE:
1. Opening Hook - Compelling first paragraph approach
2. Company Connection - Why this specific company appeals to you
3. Relevant Experience - 2-3 key experiences that directly relate
4. Value Proposition - What unique value you bring
5. Closing - Professional yet memorable conclusion

GUIDELINES:
- Make it specific to this company and role
- Include suggested talking points for each section
- Focus on achievements over responsibilities
- Show enthusiasm for the company mission/values
- Provide actionable bullet points the user can expand on

Create an outline that serves as a clear roadmap for writing a compelling, personalized cover letter.
```

### Using the Sample Prompts

1. **Copy and paste** these prompts into your Configuration page
2. **Customize as needed** for your industry or preferences
3. **Test with a sample job** to ensure the output format works for you
4. **Refine the prompts** based on the quality of results you receive

**Important Notes:**
- The Job Analysis prompt must return valid JSON or the system will show an error
- The customizedResume field should contain your complete resume text, not just changes
- The matchedKeywords and unmatchedKeywords fields must be arrays of strings
- Company information from the first service automatically feeds into the cover letter service
- Both prompts can be modified to match your writing style and industry focus
- Keyword matching helps identify skills gaps and resume optimization opportunities

---

## Resume Format Options

The Job Tracker Application supports two resume formats to accommodate different user needs and enable advanced features:

### Text Format (Default)
- **Backward Compatible**: Works with existing plain text resumes
- **Simple Setup**: Easy copy-paste from existing resume documents
- **AI Compatible**: AI services can process and customize text resumes
- **Use Case**: Quick setup, users comfortable with text-only resumes

### Structured JSON Format (Advanced)
- **Rich Data Structure**: Organized resume sections with detailed metadata
- **Advanced Features**: Enables PDF export, multiple templates, enhanced formatting
- **Better AI Processing**: AI can work with structured data for more precise customization
- **Professional Output**: Multiple viewing formats (formatted, text, JSON)
- **Future-Ready**: Foundation for advanced resume features

## Structured Resume JSON Schema

When using the structured format, your resume data should follow this JSON schema:

### Complete Schema Structure

```json
{
  "contact": {
    "name": "string (required)",
    "email": "string (required)",
    "phone": "string (optional)",
    "location": "string (optional)",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "website": "string (optional)"
  },
  "summary": "string (optional)",
  "experience": [
    {
      "company": "string (required)",
      "position": "string (required)",
      "startDate": "string (required)",
      "endDate": "string (optional - omit for current position)",
      "location": "string (optional)",
      "description": ["array of strings (required)"],
      "technologies": ["array of strings (optional)"]
    }
  ],
  "education": [
    {
      "institution": "string (required)",
      "degree": "string (required)",
      "field": "string (optional)",
      "graduationDate": "string (optional)",
      "location": "string (optional)",
      "gpa": "string (optional)",
      "honors": ["array of strings (optional)"]
    }
  ],
  "skills": [
    {
      "category": "string (required)",
      "items": ["array of strings (required)"]
    }
  ],
  "projects": [
    {
      "name": "string (required)",
      "description": "string (required)",
      "technologies": ["array of strings (optional)"],
      "url": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)"
    }
  ],
  "certifications": ["array of strings (optional)"],
  "awards": ["array of strings (optional)"]
}
```

### Example Structured Resume

```json
{
  "contact": {
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "(555) 123-4567",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/johnsmith",
    "github": "https://github.com/johnsmith",
    "website": "https://johnsmith.dev"
  },
  "summary": "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and solving complex technical challenges.",
  "experience": [
    {
      "company": "Tech Innovations Inc.",
      "position": "Senior Software Engineer",
      "startDate": "January 2022",
      "location": "San Francisco, CA",
      "description": [
        "Led development of microservices architecture serving 1M+ daily users",
        "Reduced API response times by 40% through database optimization",
        "Mentored 3 junior developers and established code review processes"
      ],
      "technologies": ["Node.js", "React", "PostgreSQL", "Docker", "AWS"]
    },
    {
      "company": "StartupCorp",
      "position": "Software Engineer",
      "startDate": "June 2019",
      "endDate": "December 2021",
      "location": "Remote",
      "description": [
        "Built responsive web applications using React and TypeScript",
        "Implemented automated testing reducing bug reports by 60%",
        "Collaborated with design team to improve user interface"
      ],
      "technologies": ["React", "TypeScript", "Jest", "CSS3", "REST APIs"]
    }
  ],
  "education": [
    {
      "institution": "University of California, Berkeley",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduationDate": "May 2019",
      "location": "Berkeley, CA",
      "gpa": "3.7",
      "honors": ["Dean's List", "Phi Beta Kappa"]
    }
  ],
  "skills": [
    {
      "category": "Programming Languages",
      "items": ["JavaScript", "TypeScript", "Python", "Java", "Go"]
    },
    {
      "category": "Frontend",
      "items": ["React", "Vue.js", "HTML5", "CSS3", "Tailwind CSS"]
    },
    {
      "category": "Backend",
      "items": ["Node.js", "Express", "Django", "PostgreSQL", "MongoDB"]
    },
    {
      "category": "Tools & Platforms",
      "items": ["Git", "Docker", "AWS", "Jenkins", "Linux"]
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Full-stack e-commerce application with payment processing and inventory management",
      "technologies": ["React", "Node.js", "PostgreSQL", "Stripe API"],
      "url": "https://github.com/johnsmith/ecommerce-platform",
      "startDate": "March 2023",
      "endDate": "August 2023"
    }
  ],
  "certifications": [
    "AWS Certified Solutions Architect",
    "Google Cloud Professional Developer"
  ],
  "awards": [
    "Employee of the Month - Tech Innovations Inc. (2023)",
    "Hackathon Winner - Berkeley CodeFest (2018)"
  ]
}
```

### Field Descriptions

#### Contact Section (Required)
- **name**: Your full name as it should appear on the resume
- **email**: Professional email address
- **phone**: Phone number with preferred formatting
- **location**: City, State or general location (not full address for privacy)
- **linkedin**: Full LinkedIn profile URL
- **github**: GitHub profile URL (especially important for developers)
- **website**: Personal website or portfolio URL

#### Experience Section (Required)
- **company**: Official company name
- **position**: Your job title
- **startDate**: Start date (flexible format: "January 2022", "Jan 2022", "01/2022")
- **endDate**: End date (omit for current position)
- **location**: Work location (office city or "Remote")
- **description**: Array of bullet points describing achievements and responsibilities
- **technologies**: Technologies, tools, or skills used in the role

#### Education Section (Required)
- **institution**: School/university name
- **degree**: Degree type (Bachelor of Science, Master of Arts, etc.)
- **field**: Major or field of study
- **graduationDate**: Graduation date
- **gpa**: Grade point average if notable (3.5+ typically)
- **honors**: Academic honors, awards, or distinctions

#### Skills Section (Required)
- **category**: Skill category name (Programming Languages, Tools, etc.)
- **items**: Array of specific skills in that category

#### Projects Section (Optional)
- **name**: Project name
- **description**: Brief description of the project and its purpose
- **technologies**: Technologies used in the project
- **url**: GitHub repository or live demo URL
- **startDate/endDate**: Project timeline

### Converting from Text to Structured Format

1. **Start with Contact Info**: Copy your name, email, phone, and links
2. **Break Down Experience**: Convert each job into the experience object format
3. **Organize Skills**: Group skills into logical categories
4. **Add Education**: Include degree information
5. **Optional Sections**: Add projects, certifications, awards as available

### Tips for Best Results

- **Use Consistent Date Formats**: Stick to one format throughout (e.g., "January 2022")
- **Write Achievement-Focused Descriptions**: Use action verbs and quantifiable results
- **Group Skills Logically**: Organize by technology type, not alphabetically
- **Keep Descriptions Concise**: 1-2 lines per achievement for readability
- **Include Relevant Keywords**: Use industry-standard terms for better AI processing

---

This application provides a comprehensive solution for modern job seekers, combining the power of AI with intuitive user experience to streamline and optimize the job application process.