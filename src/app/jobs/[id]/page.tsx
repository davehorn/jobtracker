'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building, Calendar, DollarSign, FileText, Briefcase, Edit, Save, X, Download, CheckSquare, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import SalaryPromptModal from '@/components/SalaryPromptModal'
import JobEditModal from '@/components/JobEditModal'
import ResumeDisplay from '@/components/ResumeDisplay'
import StructuredResumeEditor from '@/components/StructuredResumeEditor'
import { validateStructuredResume } from '@/lib/resume-utils'
import { exportResumeToPDF, isPDFExportSupported } from '@/lib/pdf-export'

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
  matchedKeywords: string | null
  unmatchedKeywords: string | null
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
  const [editorMode, setEditorMode] = useState<'form' | 'json'>('form')
  const [exportingPDF, setExportingPDF] = useState(false)
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
    console.log('[DEBUG] ========== STARTING RESUME EDIT ==========')
    
    if (!job?.jobResume) {
      console.log('[DEBUG] No job resume data found')
      return
    }
    
    console.log('[DEBUG] Job resume data length:', job.jobResume.length)
    console.log('[DEBUG] Job resume preview:', job.jobResume.substring(0, 200))
    
    // Check if this is a structured resume (JSON) and set default editor mode
    let isStructured = false
    try {
      const parsed = JSON.parse(job.jobResume)
      console.log('[DEBUG] ✅ JSON parsing successful')
      console.log('[DEBUG] JSON keys found:', Object.keys(parsed))
      
      const validationResult = validateStructuredResume(parsed)
      console.log('[DEBUG] Validation result:', validationResult)
      
      if (validationResult) {
        isStructured = true
        console.log('[DEBUG] ✅ STRUCTURED RESUME DETECTED - Will use FORM editor')
        // Format JSON with proper indentation for JSON editor
        setEditedResumeContent(JSON.stringify(parsed, null, 2))
      } else {
        console.log('[DEBUG] ❌ Invalid structured resume - Will use JSON editor')
        // Not a valid structured resume, treat as plain text
        setEditedResumeContent(job.jobResume)
      }
    } catch (error) {
      console.log('[DEBUG] ❌ JSON parsing failed - Will use JSON editor')
      console.log('[DEBUG] Parse error:', error)
      // Not valid JSON, treat as plain text
      setEditedResumeContent(job.jobResume)
    }
    
    // Set default editor mode: form for structured resumes, JSON for plain text
    const selectedMode = isStructured ? 'form' : 'json'
    console.log('[DEBUG] 🎯 FINAL EDITOR MODE:', selectedMode)
    
    setEditorMode(selectedMode)
    setResumeEditError(null)
    setEditingResume(true)
    
    console.log('[DEBUG] ========== RESUME EDIT SETUP COMPLETE ==========')
  }

  const cancelResumeEdit = () => {
    setEditingResume(false)
    setEditedResumeContent('')
    setResumeEditError(null)
  }

  const handleFormSave = (resumeData: string) => {
    saveResumeWithData(resumeData)
  }

  const saveResumeWithData = async (resumeData: string) => {
    if (!job) return

    setResumeEditError(null)
    setUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobResume: resumeData })
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

    saveResumeWithData(trimmedContent)
  }

  const getUserNameFromConfig = async (): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      
      if (data.success && data.data?.structuredResume) {
        const structuredResume = JSON.parse(data.data.structuredResume)
        return structuredResume?.contact?.name
      }
    } catch (error) {
      console.log('[JOB] Could not fetch user name from config:', error)
    }
    return undefined
  }

  const handleExportPDF = async () => {
    console.log('[JOB] 🚀 PDF Export button clicked')
    console.log('[JOB] Job data:', {
      id: job?.id,
      companyName: job?.companyName,
      title: job?.title,
      hasResume: !!job?.jobResume,
      resumeLength: job?.jobResume?.length || 0
    })
    
    if (!job?.jobResume) {
      console.log('[JOB] ❌ No resume data available')
      setError('No resume data available to export')
      return
    }

    console.log('[JOB] Resume data preview:', job.jobResume.substring(0, 200))
    
    setExportingPDF(true)
    setError(null)

    try {
      console.log('[JOB] 📞 Fetching user name from configuration...')
      const userName = await getUserNameFromConfig()
      console.log('[JOB] User name:', userName || 'Not found')
      
      console.log('[JOB] 📞 Calling exportResumeToPDF function...')
      await exportResumeToPDF({
        resumeData: job.jobResume,
        companyName: job.companyName || undefined,
        jobTitle: job.title || undefined,
        userName: userName
      })
      console.log('[JOB] ✅ PDF export completed successfully')
    } catch (err) {
      console.error('[JOB] ❌ PDF export error:', err)
      setError(err instanceof Error ? err.message : 'Failed to export PDF')
    } finally {
      setExportingPDF(false)
    }
  }

  // Helper functions for keyword parsing
  const parseKeywords = (keywordJson: string | null): string[] => {
    if (!keywordJson) return []
    
    try {
      const parsed = JSON.parse(keywordJson)
      if (Array.isArray(parsed)) {
        return parsed.filter(keyword => typeof keyword === 'string' && keyword.trim() !== '')
      }
    } catch (error) {
      console.warn('Failed to parse keywords JSON:', error)
    }
    
    return []
  }

  const getMatchedKeywords = (): string[] => parseKeywords(job?.matchedKeywords || null)
  const getUnmatchedKeywords = (): string[] => parseKeywords(job?.unmatchedKeywords || null)

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
        {(job.jobInfo || job.jobResume || job.coverLetterOutline || getMatchedKeywords().length > 0 || getUnmatchedKeywords().length > 0) && (
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleExportPDF}
                          disabled={updating || exportingPDF || !isPDFExportSupported()}
                          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!isPDFExportSupported() ? 'PDF export not supported in this browser' : 'Export resume as PDF'}
                        >
                          <Download className="h-3 w-3" />
                          <span>{exportingPDF ? 'Exporting...' : 'Export PDF'}</span>
                        </button>
                        <button
                          onClick={startResumeEdit}
                          disabled={updating}
                          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    {editingResume ? (
                      <div className="space-y-4">
                        {/* Editor Mode Toggle */}
                        <div className="flex items-center justify-between border-b border-green-200 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Edit Mode:</span>
                            <button
                              onClick={() => {
                                console.log('[DEBUG] User clicked Form Editor button')
                                setEditorMode('form')
                              }}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                editorMode === 'form'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Form Editor
                            </button>
                            <button
                              onClick={() => {
                                console.log('[DEBUG] User clicked JSON Editor button')
                                setEditorMode('json')
                              }}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                editorMode === 'json'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              JSON Editor
                            </button>
                          </div>
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            Active: {editorMode.toUpperCase()}
                          </div>
                        </div>

                        {/* Form Editor */}
                        {editorMode === 'form' && (
                          <div>
                            <div className="mb-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              🔧 DEBUG: Form Editor Active - Loading StructuredResumeEditor component
                            </div>
                            <StructuredResumeEditor
                              initialData={job.jobResume || '{}'}
                              onSave={handleFormSave}
                              onCancel={cancelResumeEdit}
                              loading={updating}
                            />
                          </div>
                        )}

                        {/* JSON Editor */}
                        {editorMode === 'json' && (
                          <div className="space-y-4">
                            <div className="mb-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              🔧 DEBUG: JSON Editor Active
                            </div>
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
                        )}
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

              {/* Keywords Analysis */}
              {(getMatchedKeywords().length > 0 || getUnmatchedKeywords().length > 0) && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-gray-600" />
                    <span>Keywords Analysis</span>
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Matched Keywords */}
                    {getMatchedKeywords().length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Skills Match ({getMatchedKeywords().length} keywords)
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="flex flex-wrap gap-2">
                            {getMatchedKeywords().map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Unmatched Keywords */}
                    {getUnmatchedKeywords().length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Skills to Develop ({getUnmatchedKeywords().length} keywords)
                          </span>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                          <div className="flex flex-wrap gap-2">
                            {getUnmatchedKeywords().map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show AI processing status if no AI content yet */}
        {!job.jobInfo && !job.jobResume && !job.coverLetterOutline && getMatchedKeywords().length === 0 && getUnmatchedKeywords().length === 0 && (
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