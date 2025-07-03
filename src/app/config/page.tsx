'use client'

import { FileText, MessageSquare, Key, Info, Save, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'
import ResumePreview from '@/components/ResumePreview'

interface Configuration {
  id: string
  sourceResume: string
  resumePrompt: string
  coverLetterPrompt: string
  selectedModel: string
  resumeFormat: 'text' | 'structured'
  structuredResume: string | null
}

export default function Configuration() {
  const [config, setConfig] = useState<Configuration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    fetchConfiguration()
  }, [])

  const fetchConfiguration = async () => {
    try {
      console.log('[Config] Fetching configuration from API')
      const response = await fetch('/api/config')
      const data = await response.json()
      console.log('[Config] API response:', { success: data.success, hasData: !!data.data })
      
      if (data.success && data.data) {
        console.log('[Config] Configuration loaded successfully')
        setConfig(data.data)
      } else {
        console.log('[Config] No existing configuration found, initializing empty config')
        // Initialize with empty configuration
        setConfig({
          id: '',
          sourceResume: '',
          resumePrompt: '',
          coverLetterPrompt: '',
          selectedModel: 'gpt-3.5-turbo',
          resumeFormat: 'text',
          structuredResume: null
        })
      }
    } catch (error) {
      console.error('[Config] Error fetching configuration:', error)
      setMessage({type: 'error', text: 'Failed to load configuration'})
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    
    console.log('[Config] Starting configuration save')
    console.log('[Config] Config to save:', {
      hasSourceResume: !!config.sourceResume,
      hasResumePrompt: !!config.resumePrompt,
      hasCoverLetterPrompt: !!config.coverLetterPrompt,
      selectedModel: config.selectedModel,
      resumeFormat: config.resumeFormat,
      hasStructuredResume: !!config.structuredResume
    })
    
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      console.log('[Config] API response status:', response.status)
      const data = await response.json()
      console.log('[Config] API response data:', { success: data.success, error: data.error })
      
      if (data.success) {
        console.log('[Config] Configuration saved successfully')
        setConfig(data.data)
        setMessage({type: 'success', text: 'Configuration saved successfully!'})
      } else {
        console.error('[Config] API returned error:', data.error)
        setMessage({type: 'error', text: data.error || 'Failed to save configuration'})
      }
    } catch (error) {
      console.error('[Config] Error saving configuration:', error)
      console.error('[Config] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      setMessage({type: 'error', text: 'Failed to save configuration'})
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (field: keyof Configuration, value: string | null) => {
    if (!config) return
    setConfig({...config, [field]: value})
  }

  if (loading) {
    return (
      <main className="space-y-6 sm:space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }
  return (
    <main className="space-y-6 sm:space-y-8" role="main" aria-labelledby="config-title">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 id="config-title" className="text-2xl sm:text-3xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-600 text-sm sm:text-base">Customize your AI-powered job application workflow</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-success-50 border border-success-200 text-success-700' 
            : 'bg-error-50 border border-error-200 text-error-700'
        }`}>
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        </div>
      )}
      
      <section className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6" aria-labelledby="source-resume">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="h-5 w-5 text-primary-600" aria-hidden="true" />
          </div>
          <h2 id="source-resume" className="text-lg sm:text-xl font-semibold text-gray-900">Source Resume</h2>
        </div>
        <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          Choose between text format (backward compatible) or structured format (enables advanced features like PDF export).
        </p>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Resume Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="resumeFormat"
                  value="text"
                  checked={config?.resumeFormat === 'text'}
                  onChange={(e) => updateConfig('resumeFormat', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Text Format</div>
                  <div className="text-sm text-gray-600">Simple text format (current)</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="resumeFormat"
                  value="structured"
                  checked={config?.resumeFormat === 'structured'}
                  onChange={(e) => updateConfig('resumeFormat', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Structured Format</div>
                  <div className="text-sm text-gray-600">JSON format with export options</div>
                </div>
              </label>
            </div>
          </div>

          {config?.resumeFormat === 'text' ? (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Master Resume Content (Text)
              </label>
              <textarea
                className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-gray-400"
                placeholder="Paste your source resume here..."
                value={config?.sourceResume || ''}
                onChange={(e) => updateConfig('sourceResume', e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Structured Resume Data (JSON)
              </label>
              <textarea
                className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-gray-400 font-mono text-sm"
                placeholder='{"contact": {"name": "Your Name", "email": "email@example.com"}, "experience": [], "education": [], "skills": []}'
                value={config?.structuredResume || ''}
                onChange={(e) => updateConfig('structuredResume', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Use structured JSON format for advanced features. See the README.md file for complete schema documentation and examples.
              </p>
            </div>
          )}
        </div>
        
        {/* Resume Preview */}
        {(config?.sourceResume || config?.structuredResume) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Resume Preview</h3>
            <ResumePreview
              resumeFormat={config.resumeFormat}
              sourceResume={config.sourceResume}
              structuredResume={config.structuredResume}
            />
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6" aria-labelledby="ai-prompts">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="p-2 bg-success-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-success-600" aria-hidden="true" />
          </div>
          <h2 id="ai-prompts" className="text-lg sm:text-xl font-semibold text-gray-900">AI Prompts</h2>
        </div>
        <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          Customize the prompts for the streamlined 2-service AI workflow: job analysis with resume customization, and cover letter outline generation.
        </p>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Job Analysis & Resume Customization Prompt
            </label>
            <textarea
              className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-gray-400"
              placeholder="Enter prompt for job analysis and resume customization..."
              value={config?.resumePrompt || ''}
              onChange={(e) => updateConfig('resumePrompt', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              This prompt analyzes job postings, extracts company details (name, title, salary, background), and customizes your resume. Must return structured JSON with: companyName, title, salaryRange, companyInfo, customizedResume.
            </p>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Cover Letter Outline Prompt
            </label>
            <textarea
              className="w-full h-24 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-gray-400"
              placeholder="Enter prompt for cover letter outline generation..."
              value={config?.coverLetterPrompt || ''}
              onChange={(e) => updateConfig('coverLetterPrompt', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              This prompt generates cover letter outlines using job description and company information from the job analysis service.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6" aria-labelledby="model-selection">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="p-2 bg-warning-100 rounded-lg">
            <Key className="h-5 w-5 text-warning-600" aria-hidden="true" />
          </div>
          <h2 id="model-selection" className="text-lg sm:text-xl font-semibold text-gray-900">Model Selection</h2>
        </div>
        <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
          Choose which OpenAI model to use for AI-powered features. Different models offer different performance and cost trade-offs.
        </p>
        
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            OpenAI Model
          </label>
          <select
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
            value={config?.selectedModel || 'gpt-3.5-turbo'}
            onChange={(e) => updateConfig('selectedModel', e.target.value)}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Most Cost-Effective)</option>
            <option value="gpt-4">GPT-4 (High Quality, Slower)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo (Fast & Capable)</option>
            <option value="gpt-4o">GPT-4o (Latest, Best Performance)</option>
          </select>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm font-medium text-primary-800 mb-1">Current Selection</p>
              <p className="text-sm text-primary-700">
                {config?.selectedModel === 'gpt-3.5-turbo' && '🚀 Fast and affordable'}
                {config?.selectedModel === 'gpt-4' && '🎯 High quality results'}
                {config?.selectedModel === 'gpt-4-turbo' && '⚡ Best balance of speed and quality'}
                {config?.selectedModel === 'gpt-4o' && '✨ Latest capabilities and performance'}
              </p>
            </div>
            
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm font-medium text-success-800 mb-2">Environment Setup</p>
              <p className="text-sm text-success-700 mb-3">
                API key configured via environment variables for security.
              </p>
              <a 
                href="/api/ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-success-600 text-white text-xs font-medium rounded hover:bg-success-700 transition-colors"
              >
                Test API Configuration →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </main>
  )
}