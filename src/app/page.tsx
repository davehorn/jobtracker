'use client'

import { Briefcase, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  creationDate: string
  title: string | null
  companyName: string | null
  status: string
  jobDescriptionUrl: string
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newJob, setNewJob] = useState({ url: '', description: '' })

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

  const getJobStats = () => {
    const total = jobs.length
    const pending = jobs.filter(job => job.status === 'pending').length
    const applied = jobs.filter(job => job.status === 'applied').length
    return { total, pending, applied }
  }

  const stats = getJobStats()
  const recentJobs = jobs.slice(0, 5)

  const createJob = async () => {
    if (!newJob.url.trim() || !newJob.description.trim()) return
    
    setCreating(true)
    try {
      // Step 1: Create the job
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescriptionUrl: newJob.url,
          jobDescription: newJob.description
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Update UI immediately
        setJobs([data.data, ...jobs])
        setNewJob({ url: '', description: '' })
        setShowForm(false)
        
        // Step 2: Trigger AI processing in background
        try {
          console.log('Starting AI processing for job:', data.data.id)
          const aiResponse = await fetch('/api/jobs/process-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: data.data.id })
          })
          
          const aiData = await aiResponse.json()
          if (aiData.success) {
            console.log('AI processing completed successfully')
            // Refresh jobs to show updated data
            fetchJobs()
          } else {
            console.warn('AI processing failed:', aiData.error)
          }
        } catch (aiError) {
          console.error('AI processing error:', aiError)
          // Job creation still succeeded, AI is optional
        }
      }
    } catch (error) {
      console.error('Failed to create job:', error)
    } finally {
      setCreating(false)
    }
  }
  return (
    <main className="space-y-8" role="main" aria-labelledby="dashboard-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 id="dashboard-title" className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard</h1>
        <p className="text-gray-600">Track your job application progress</p>
      </div>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Application statistics">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow" role="region" aria-labelledby="total-applications">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <h3 id="total-applications" className="text-lg font-semibold text-gray-800">Total Applications</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1" aria-describedby="total-desc">{stats.total}</p>
          <p id="total-desc" className="text-sm text-gray-500">All time applications</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow" role="region" aria-labelledby="pending-applications">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <h3 id="pending-applications" className="text-lg font-semibold text-gray-800">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-1" aria-describedby="pending-desc">{stats.pending}</p>
          <p id="pending-desc" className="text-sm text-gray-500">Awaiting response</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow" role="region" aria-labelledby="applied-applications">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <h3 id="applied-applications" className="text-lg font-semibold text-gray-800">Applied</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1" aria-describedby="applied-desc">{stats.applied}</p>
          <p id="applied-desc" className="text-sm text-gray-500">Successfully submitted</p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6" aria-labelledby="recent-applications">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </div>
            <h2 id="recent-applications" className="text-xl font-semibold text-gray-900">Recent Applications</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {showForm ? 'Cancel' : 'Add Job'}
          </button>
        </div>

        {/* Job Creation Form */}
        {showForm && (
          <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Job</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job URL
                </label>
                <input
                  type="url"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://company.com/job-posting"
                  value={newJob.url}
                  onChange={(e) => setNewJob({...newJob, url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Paste the job description here..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createJob}
                  disabled={creating || !newJob.url.trim() || !newJob.description.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        )}

{loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="space-y-4">
            {recentJobs.map(job => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {job.title || 'Job Position'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {job.companyName || 'Company'} • {new Date(job.creationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'applied' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Create your first job application to get started!</p>
          </div>
        )}
      </section>
    </main>
  )
}