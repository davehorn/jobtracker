'use client'

import { FileText, MessageSquare, Key, Info, Save, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Configuration {
  id: string
  sourceResume: string
  resumePrompt: string
  coverLetterPrompt: string
  selectedModel: string
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
      const response = await fetch('/api/config')
      const data = await response.json()
      
      if (data.success && data.data) {
        setConfig(data.data)
      } else {
        // Initialize with empty configuration
        setConfig({
          id: '',
          sourceResume: '',
          resumePrompt: '',
          coverLetterPrompt: '',
          selectedModel: 'gpt-3.5-turbo'
        })
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to load configuration'})
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      const data = await response.json()
      if (data.success) {
        setConfig(data.data)
        setMessage({type: 'success', text: 'Configuration saved successfully!'})
      } else {
        setMessage({type: 'error', text: data.error || 'Failed to save configuration'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to save configuration'})
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = (field: keyof Configuration, value: string) => {
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
          Upload or paste your master resume that will be used as the base for all customizations.
        </p>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Master Resume Content
          </label>
          <textarea
            className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors placeholder-gray-400"
            placeholder="Paste your source resume here..."
            value={config?.sourceResume || ''}
            onChange={(e) => updateConfig('sourceResume', e.target.value)}
          />
        </div>
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