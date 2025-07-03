'use client'

import { useState, useEffect } from 'react'
import { X, Briefcase, Building, DollarSign, ExternalLink } from 'lucide-react'

interface Job {
  id: string
  title: string | null
  companyName: string | null
  salaryRange: string | null
  providedSalaryRange: string | null
  jobDescriptionUrl: string
  jobDescription: string
}

interface JobEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (jobData: Partial<Job>) => void
  job: Job | null
  loading?: boolean
}

export default function JobEditModal({ isOpen, onClose, onSave, job, loading = false }: JobEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    salaryRange: '',
    providedSalaryRange: '',
    jobDescriptionUrl: '',
    jobDescription: ''
  })

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        companyName: job.companyName || '',
        salaryRange: job.salaryRange || '',
        providedSalaryRange: job.providedSalaryRange || '',
        jobDescriptionUrl: job.jobDescriptionUrl || '',
        jobDescription: job.jobDescription || ''
      })
    }
  }, [job])

  if (!isOpen || !job) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Edit Job Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Google"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applied Salary Range */}
            <div>
              <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1 text-green-600" />
                Applied Salary Range
              </label>
              <input
                id="salaryRange"
                name="salaryRange"
                type="text"
                value={formData.salaryRange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="e.g., $80,000 - $100,000"
              />
              <p className="text-xs text-gray-500 mt-1">Salary range you applied for</p>
            </div>

            {/* Posted Salary Range */}
            <div>
              <label htmlFor="providedSalaryRange" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Posted Salary Range
              </label>
              <input
                id="providedSalaryRange"
                name="providedSalaryRange"
                type="text"
                value={formData.providedSalaryRange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., $75,000 - $110,000"
              />
              <p className="text-xs text-gray-500 mt-1">Salary range from job posting</p>
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label htmlFor="jobDescriptionUrl" className="block text-sm font-medium text-gray-700 mb-2">
              <ExternalLink className="h-4 w-4 inline mr-1" />
              Job Posting URL
            </label>
            <input
              id="jobDescriptionUrl"
              name="jobDescriptionUrl"
              type="url"
              value={formData.jobDescriptionUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Job description details..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}