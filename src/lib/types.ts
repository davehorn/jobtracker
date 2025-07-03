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
}

// AI service types
export interface AIJobAnalysisResponse {
  companyName?: string
  title?: string
  salaryRange?: string
  companyInfo?: string
  customizedResume: string
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