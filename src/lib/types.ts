// Job-related types
export type JobStatus = 'pending' | 'applied' | 'closed' | 'rejected' | 'did_not_apply'

export interface Job {
  id: string
  creationDate: Date
  jobDescriptionUrl: string
  jobDescription: string
  status: string
  companyName: string | null
  title: string | null
  salaryRange: string | null
  providedSalaryRange: string | null
  jobInfo: string | null // JSON string for company information
  jobResume: string | null
  coverLetterOutline: string | null
  appliedDate: Date | null
  closedDate: Date | null
}

// Configuration types
export interface Configuration {
  id: string
  sourceResume: string
  resumePrompt: string
  coverLetterPrompt: string
  selectedModel: string
  resumeFormat: ResumeFormat
  structuredResume: string | null
}

// API request/response types
export interface CreateJobRequest {
  jobDescriptionUrl: string
  jobDescription: string
}

export interface UpdateJobRequest {
  status?: JobStatus
  title?: string
  companyName?: string
  salaryRange?: string
  providedSalaryRange?: string
  jobDescriptionUrl?: string
  jobDescription?: string
  jobResume?: string
  coverLetterOutline?: string
}

export interface UpdateConfigurationRequest {
  sourceResume?: string
  resumePrompt?: string
  coverLetterPrompt?: string
  selectedModel?: string
  resumeFormat?: ResumeFormat
  structuredResume?: string
}

// AI service types
export interface AIJobAnalysisResponse {
  companyName?: string
  title?: string
  salaryRange?: string
  companyInfo?: string
  customizedResume: string
  matchedKeywords: string[]
  unmatchedKeywords: string[]
}

export interface AICoverLetterResponse {
  coverLetterOutline: string
}

// Chrome extension types
export interface ExtensionJobRequest {
  url: string
  description: string
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Job statistics for dashboard
export interface JobStats {
  total: number
  pending: number
  applied: number
  closed: number
  rejected: number
  didNotApply: number
}

// Structured Resume Types
export interface ResumeContact {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
}

export interface ResumeExperience {
  company: string
  position: string
  startDate: string
  endDate?: string // null/undefined for current position
  location?: string
  description: string[]
  technologies?: string[]
}

export interface ResumeEducation {
  institution: string
  degree: string
  field?: string
  graduationDate?: string
  location?: string
  gpa?: string
  honors?: string[]
}

export interface ResumeProject {
  name: string
  description: string
  technologies?: string[]
  url?: string
  startDate?: string
  endDate?: string
}

export interface ResumeSkill {
  category: string
  items: string[]
}

export interface StructuredResume {
  contact: ResumeContact
  summary?: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  skills: ResumeSkill[]
  projects?: ResumeProject[]
  certifications?: string[]
  awards?: string[]
}

// Resume format types for backward compatibility
export type ResumeFormat = 'text' | 'structured'

export interface ResumeData {
  format: ResumeFormat
  content: string | StructuredResume
}