'use client'

import { useState } from 'react'
import { X, DollarSign } from 'lucide-react'

interface SalaryPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (salaryRange?: string) => void
  jobTitle?: string
}

export default function SalaryPromptModal({ isOpen, onClose, onConfirm, jobTitle }: SalaryPromptModalProps) {
  const [salaryRange, setSalaryRange] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(salaryRange.trim() || undefined)
    setSalaryRange('')
    onClose()
  }

  const handleSkip = () => {
    onConfirm(undefined)
    setSalaryRange('')
    onClose()
  }

  const handleCancel = () => {
    setSalaryRange('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Salary Range Applied</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {jobTitle ? `For "${jobTitle}"` : 'For this position'}, what salary range did you request in your application?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            This is optional - you can skip if the application didn't ask for salary expectations.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="salary-range" className="block text-sm font-medium text-gray-700">
              Salary Range (optional)
            </label>
            <input
              id="salary-range"
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g., $80,000 - $100,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {salaryRange.trim() ? 'Save & Apply' : 'Apply Without Salary'}
          </button>
        </div>
      </div>
    </div>
  )
}