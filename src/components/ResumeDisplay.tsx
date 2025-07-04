'use client'

import { StructuredResume } from '@/lib/types'
import { professionalTemplate } from '@/lib/resume-templates'
import { validateStructuredResume } from '@/lib/resume-utils'

interface ResumeDisplayProps {
  resumeData: string | null
  className?: string
}

export default function ResumeDisplay({ resumeData, className = '' }: ResumeDisplayProps) {
  if (!resumeData) {
    return null
  }

  // Try to determine if this is a JSON string (structured resume) or plain text
  const isStructuredResume = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      return validateStructuredResume(parsed)
    } catch {
      return false
    }
  }

  // If it's a structured resume, render with template
  if (isStructuredResume(resumeData)) {
    try {
      const structuredResume = JSON.parse(resumeData) as StructuredResume
      const htmlContent = professionalTemplate.generateHTML(structuredResume)
      
      return (
        <div 
          className={`resume-preview prose prose-sm max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )
    } catch (error) {
      console.error('Error parsing structured resume:', error)
      // Fall back to plain text display if parsing fails
      return (
        <div className={`text-gray-700 text-sm whitespace-pre-wrap ${className}`}>
          {resumeData}
        </div>
      )
    }
  }

  // Plain text resume - display as-is
  return (
    <div className={`text-gray-700 text-sm whitespace-pre-wrap ${className}`}>
      {resumeData}
    </div>
  )
}