'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building, Calendar, DollarSign, FileText, Briefcase, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import SalaryPromptModal from '@/components/SalaryPromptModal'
import JobEditModal from '@/components/JobEditModal'
import ResumeDisplay from '@/components/ResumeDisplay'
import { validateStructuredResume } from '@/lib/resume-utils'

interface Job {
  id: string
  creationDate: string
  jobDescriptionUrl: string
  jobDescription: string
  status: string
  companyName: string | null
  title: string | null
  salaryRange: string | null
  providedSalaryRange: string | null
  jobInfo: string | null
  jobResume: string | null
  coverLetterOutline: string | null
  appliedDate: string | null
  closedDate: string | null
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [salaryPrompt, setSalaryPrompt] = useState<{
    isOpen: boolean
    jobTitle: string
  }>({ isOpen: false, jobTitle: '' })
  const [editModal, setEditModal] = useState(false)
  const [editingResume, setEditingResume] = useState(false)
  const [editedResumeContent, setEditedResumeContent] = useState('')
  const [resumeEditError, setResumeEditError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setJob(data.data)
      } else {
        setError(data.error || 'Failed to load job')
      }
    } catch (err) {
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (newStatus: string) => {
    if (!job) return
    
    // If changing to "applied" status, show salary prompt modal
    if (newStatus === 'applied') {
      setSalaryPrompt({
        isOpen: true,
        jobTitle: job.title || 'Job Position'
      })
      return
    }

    // For other statuses, update directly
    setUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        setJob(data.data)
      } else {
        setError(data.error || 'Failed to update job')
      }
    } catch (err) {
      setError('Failed to update job')
    } finally {
      setUpdating(false)
    }
  }

  const handleSalaryPromptConfirm = async (salaryRange?: string) => {
    if (!job) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'applied',
          ...(salaryRange && { salaryRange })
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setJob(data.data)
      } else {
        setError(data.error || 'Failed to update job')
      }
    } catch (err) {
      setError('Failed to update job')
    } finally {
      setUpdating(false)
    }
  }

  const handleJobEdit = async (jobData: Partial<Job>) => {
    if (!job) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })
      
      const data = await response.json()
      if (data.success) {
        setJob(data.data)
        setEditModal(false)
      } else {
        setError(data.error || 'Failed to update job')
      }
    } catch (err) {
      setError('Failed to update job')
    } finally {
      setUpdating(false)
    }
  }

  const startResumeEdit = () => {
    if (!job?.jobResume) return
    
    // Check if this is a structured resume (JSON) and format it for better readability
    try {
      const parsed = JSON.parse(job.jobResume)
      if (validateStructuredResume(parsed)) {
        // Format JSON with proper indentation
        setEditedResumeContent(JSON.stringify(parsed, null, 2))
      } else {
        // Not a valid structured resume, treat as plain text
        setEditedResumeContent(job.jobResume)
      }
    } catch {
      // Not valid JSON, treat as plain text
      setEditedResumeContent(job.jobResume)
    }
    
    setResumeEditError(null)
    setEditingResume(true)
  }

  const cancelResumeEdit = () => {
    setEditingResume(false)
    setEditedResumeContent('')
    setResumeEditError(null)
  }

  const saveResumeEdit = async () => {
    if (!job || !editedResumeContent.trim()) return

    // Validate JSON if it looks like structured resume content
    const trimmedContent = editedResumeContent.trim()
    if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmedContent)
        if (!validateStructuredResume(parsed)) {
          setResumeEditError('Invalid structured resume format. Please check the JSON structure matches the expected schema.')
          return
        }
      } catch (error) {
        setResumeEditError('Invalid JSON format. Please check your syntax for missing quotes, commas, or brackets.')
        return
      }
    }

    setResumeEditError(null)
    setUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobResume: trimmedContent })
      })
      
      const data = await response.json()
      if (data.success) {
        setJob(data.data)
        setEditingResume(false)
        setEditedResumeContent('')
        setResumeEditError(null)
      } else {
        setError(data.error || 'Failed to update resume')
      }
    } catch (err) {
      setError('Failed to update resume')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  if (error || !job) {
    return (
      <main className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested job could not be found.'}</p>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const statusColors = {
    pending: 'bg-warning-100 text-warning-800',
    applied: 'bg-success-100 text-success-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-error-100 text-error-800',
    did_not_apply: 'bg-gray-100 text-gray-600'
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setEditModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Job</span>
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Job Information */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {job.title || 'Job Position'}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              {job.companyName && (
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4" />
                  <span>{job.companyName}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Added {new Date(job.creationDate).toLocaleDateString()}</span>
              </div>
              {job.salaryRange && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{job.salaryRange} (Applied Salary)</span>
                </div>
              )}
              {job.providedSalaryRange && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{job.providedSalaryRange} (Posted Salary)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {['pending', 'applied', 'closed', 'rejected', 'did_not_apply'].map(status => (
              <button
                key={status}
                onClick={() => updateJobStatus(status)}
                disabled={updating || job.status === status}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  job.status === status
                    ? 'bg-primary-600 text-white cursor-default'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                {updating ? 'Updating...' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <a 
                href={job.jobDescriptionUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View Original Job Posting →
              </a>
            </div>
            <div className="text-gray-700 text-sm whitespace-pre-wrap">
              {job.jobDescription || 'No job description available.'}
            </div>
          </div>
        </div>

        {/* AI-Generated Content */}
        {(job.jobInfo || job.jobResume || job.coverLetterOutline) && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Content</h3>
            <div className="space-y-6">
              
              {/* Company Information */}
              {job.jobInfo && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span>Company Information</span>
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                      {job.jobInfo}
                    </div>
                  </div>
                </div>
              )}

              {/* Customized Resume */}
              {job.jobResume && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span>Customized Resume</span>
                    </h4>
                    {!editingResume && (
                      <button
                        onClick={startResumeEdit}
                        disabled={updating}
                        className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    {editingResume ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <textarea
                            value={editedResumeContent}
                            onChange={(e) => setEditedResumeContent(e.target.value)}
                            className="w-full h-96 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-mono resize-none bg-gray-50"
                            placeholder="Edit your resume content..."
                          />
                          {editedResumeContent.trim().startsWith('{') && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              📝 Structured resume detected - JSON format with proper indentation for easy editing
                            </div>
                          )}
                        </div>
                        {resumeEditError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <div className="text-red-600 text-sm">
                                <strong>Validation Error:</strong> {resumeEditError}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={saveResumeEdit}
                            disabled={updating || !editedResumeContent.trim()}
                            className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                          >
                            <Save className="h-4 w-4" />
                            <span>{updating ? 'Saving...' : 'Save'}</span>
                          </button>
                          <button
                            onClick={cancelResumeEdit}
                            disabled={updating}
                            className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm font-medium"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ResumeDisplay resumeData={job.jobResume} />
                    )}
                  </div>
                </div>
              )}

              {/* Cover Letter Outline */}
              {job.coverLetterOutline && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span>Cover Letter Outline</span>
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                      {job.coverLetterOutline}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show AI processing status if no AI content yet */}
        {!job.jobInfo && !job.jobResume && !job.coverLetterOutline && (
          <div className="border-t pt-6 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-gray-600 text-sm">
                AI content generation in progress or not yet configured...
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Refresh to check for updates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Salary Prompt Modal */}
      <SalaryPromptModal
        isOpen={salaryPrompt.isOpen}
        onClose={() => setSalaryPrompt({ isOpen: false, jobTitle: '' })}
        onConfirm={handleSalaryPromptConfirm}
        jobTitle={salaryPrompt.jobTitle}
      />

      {/* Job Edit Modal */}
      <JobEditModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSave={handleJobEdit}
        job={job}
        loading={updating}
      />
    </main>
  )
}