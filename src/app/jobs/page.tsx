'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, Filter, Trash2, ExternalLink, Calendar, Building, DollarSign } from 'lucide-react'
import SalaryPromptModal from '@/components/SalaryPromptModal'

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
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [salaryPrompt, setSalaryPrompt] = useState<{
    isOpen: boolean
    jobId: string
    jobTitle: string
  }>({ isOpen: false, jobId: '', jobTitle: '' })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      if (data.success) {
        setJobs(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    setDeleting(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        setJobs(jobs.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    } finally {
      setDeleting(null)
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    // If changing to "applied" status, show salary prompt modal
    if (newStatus === 'applied') {
      const job = jobs.find(j => j.id === jobId)
      setSalaryPrompt({
        isOpen: true,
        jobId,
        jobTitle: job?.title || 'Job Position'
      })
      return
    }

    // For other statuses, update directly
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      if (data.success) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ))
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const handleSalaryPromptConfirm = async (salaryRange?: string) => {
    try {
      const response = await fetch(`/api/jobs/${salaryPrompt.jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'applied',
          ...(salaryRange && { salaryRange })
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setJobs(jobs.map(job => 
          job.id === salaryPrompt.jobId 
            ? { ...job, status: 'applied', ...(salaryRange && { salaryRange }) }
            : job
        ))
      }
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter)

  const statusOptions = [
    { value: 'all', label: 'All Jobs' },
    { value: 'pending', label: 'Pending' },
    { value: 'applied', label: 'Applied' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'did_not_apply', label: 'Did Not Apply' }
  ]

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    applied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
    did_not_apply: 'bg-gray-100 text-gray-600'
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Job Management</h1>
          <p className="text-gray-600">{filteredJobs.length} jobs found</p>
        </div>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filter:</span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {job.title || 'Job Position'}
                  </Link>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    {job.companyName && (
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(job.creationDate).toLocaleDateString()}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">{job.salaryRange} (Applied)</span>
                      </div>
                    )}
                    {job.providedSalaryRange && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.providedSalaryRange} (Posted)</span>
                      </div>
                    )}
                    <a 
                      href={job.jobDescriptionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Original</span>
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => deleteJob(job.id)}
                    disabled={deleting === job.id}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {['pending', 'applied', 'closed', 'rejected', 'did_not_apply'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateJobStatus(job.id, status)}
                    disabled={job.status === status}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      job.status === status
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No jobs found' : `No ${filter} jobs found`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Create your first job application to get started!'
                : 'Try selecting a different filter or create new jobs.'
              }
            </p>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}
      </div>

      {/* Salary Prompt Modal */}
      <SalaryPromptModal
        isOpen={salaryPrompt.isOpen}
        onClose={() => setSalaryPrompt({ isOpen: false, jobId: '', jobTitle: '' })}
        onConfirm={handleSalaryPromptConfirm}
        jobTitle={salaryPrompt.jobTitle}
      />
    </main>
  )
}