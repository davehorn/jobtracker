'use client'

import { useState } from 'react'
import { StructuredResume, ResumeFormat } from '@/lib/types'
import { getResumeText, validateStructuredResume, parseResumeData } from '@/lib/resume-utils'
import { professionalTemplate } from '@/lib/resume-templates'
import { Eye, FileText, Code } from 'lucide-react'

interface ResumePreviewProps {
  resumeFormat: ResumeFormat
  sourceResume: string
  structuredResume: string | null
}

export default function ResumePreview({ resumeFormat, sourceResume, structuredResume }: ResumePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'formatted' | 'text' | 'json'>('formatted')

  // Get the resume content based on format
  const getResumeContent = () => {
    if (resumeFormat === 'text') {
      return sourceResume
    } else if (resumeFormat === 'structured' && structuredResume) {
      try {
        const parsed = JSON.parse(structuredResume)
        if (validateStructuredResume(parsed)) {
          return parsed as StructuredResume
        }
      } catch (error) {
        // Invalid JSON
      }
    }
    return null
  }

  const resumeContent = getResumeContent()

  if (!resumeContent) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-600 text-sm">
          {resumeFormat === 'structured' 
            ? 'Enter valid structured resume JSON to see preview'
            : 'Enter resume content to see preview'
          }
        </div>
      </div>
    )
  }

  const renderFormattedPreview = () => {
    if (resumeFormat === 'text') {
      return (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {resumeContent as string}
          </pre>
        </div>
      )
    } else {
      // Structured resume - use template
      const htmlContent = professionalTemplate.generateHTML(resumeContent as StructuredResume)
      return (
        <div 
          className="resume-preview prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )
    }
  }

  const renderTextPreview = () => {
    if (resumeFormat === 'text') {
      return resumeContent as string
    } else {
      const resumeData = { format: resumeFormat, content: resumeContent }
      return getResumeText(resumeData)
    }
  }

  const renderJsonPreview = () => {
    if (resumeFormat === 'structured' && structuredResume) {
      try {
        const parsed = JSON.parse(structuredResume)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return structuredResume
      }
    }
    return 'JSON format not available for text resumes'
  }

  return (
    <div className="space-y-4">
      {/* Preview Mode Selector */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <h4 className="text-sm font-semibold text-gray-900 mr-3">Preview:</h4>
        <button
          onClick={() => setPreviewMode('formatted')}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
            previewMode === 'formatted'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Formatted</span>
        </button>
        <button
          onClick={() => setPreviewMode('text')}
          className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
            previewMode === 'text'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Text</span>
        </button>
        {resumeFormat === 'structured' && (
          <button
            onClick={() => setPreviewMode('json')}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              previewMode === 'json'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>JSON</span>
          </button>
        )}
      </div>

      {/* Preview Content */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-96 max-h-96 overflow-auto">
        {previewMode === 'formatted' && renderFormattedPreview()}
        {previewMode === 'text' && (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {renderTextPreview()}
          </pre>
        )}
        {previewMode === 'json' && (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {renderJsonPreview()}
          </pre>
        )}
      </div>
    </div>
  )
}