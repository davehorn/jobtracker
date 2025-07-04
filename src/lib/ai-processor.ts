import { prisma } from './prisma'
import { Configuration, Job } from './types'

export interface AIProcessingResult {
  success: boolean
  error?: string
  results?: {
    jobAnalysis?: any
    coverLetterOutline?: string
  }
}

/**
 * Processes a job through the 2-service AI workflow and updates the database
 * @param jobId - The job ID to process
 * @param config - Configuration containing prompts and settings
 * @returns Processing result with success/error information
 */
export async function processJobWithAI(jobId: string, config: Configuration): Promise<AIProcessingResult> {
  try {
    console.log('AI Processor: Starting processJobWithAI for job:', jobId)
    
    // Get the job from database
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      console.error('AI Processor: Job not found:', jobId)
      return { success: false, error: 'Job not found' }
    }

    console.log('AI Processor: Job found', {
      jobId: job.id,
      hasDescription: !!job.jobDescription,
      descriptionLength: job.jobDescription?.length || 0
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('AI Processor: Using base URL:', baseUrl)
    
    const results: any = {}

    // Determine resume format and content
    const resumeFormat = config.resumeFormat || 'text'
    const resumeContent = resumeFormat === 'structured' && config.structuredResume 
      ? config.structuredResume 
      : config.sourceResume

    // DEBUG LOGGING: Resume data validation
    console.log('\n=== DEBUG: AI Processor Resume Data Analysis ===')
    console.log('Resume Format Selected:', resumeFormat)
    console.log('Config has sourceResume:', !!config.sourceResume)
    console.log('Config has structuredResume:', !!config.structuredResume)
    console.log('Resume Content Length:', resumeContent?.length || 0)
    console.log('Resume Content Type:', typeof resumeContent)
    
    // Log resume content structure
    if (resumeFormat === 'structured' && resumeContent) {
      try {
        const parsedResume = JSON.parse(resumeContent)
        console.log('Structured Resume Sections Found:', Object.keys(parsedResume))
        console.log('Contact Info:', parsedResume.contact ? 'Present' : 'Missing')
        console.log('Experience Entries:', parsedResume.experience?.length || 0)
        console.log('Certifications:', parsedResume.certifications?.length || 0)
        console.log('Education Entries:', parsedResume.education?.length || 0)
        console.log('Skills Categories:', parsedResume.skills?.length || 0)
        
        // Log certifications specifically since they're being removed
        if (parsedResume.certifications) {
          console.log('Original Certifications List:', parsedResume.certifications)
        }
      } catch (parseError) {
        console.error('Failed to parse structured resume:', parseError)
        console.log('Raw resume content (COMPLETE):')
        console.log(resumeContent)
      }
    } else {
      console.log('Text Resume Content (COMPLETE):')
      console.log(resumeContent || 'NO CONTENT')
    }

    // Step 1: Job Analysis & Resume Customization
    console.log('Step 1: Running job analysis and resume customization...')
    
    // DEBUG LOGGING: API Request Body
    const requestBody = {
      sourceResume: resumeContent,
      jobDescription: job.jobDescription,
      prompt: config.resumePrompt,
      model: config.selectedModel,
      resumeFormat: resumeFormat
    }
    
    console.log('\n=== DEBUG: Job Analysis API Request ===')
    console.log('Request URL:', `${baseUrl}/api/ai?service=job-analysis`)
    console.log('Resume Format in Request:', requestBody.resumeFormat)
    console.log('Source Resume Length:', requestBody.sourceResume?.length || 0)
    console.log('Job Description Length:', requestBody.jobDescription?.length || 0)
    console.log('Prompt Length:', requestBody.prompt?.length || 0)
    console.log('Selected Model:', requestBody.model)
    console.log('Source Resume (COMPLETE - Length:', requestBody.sourceResume?.length || 0, 'chars):')
    console.log(requestBody.sourceResume || 'NO RESUME')
    
    const jobAnalysisResponse = await fetch(`${baseUrl}/api/ai?service=job-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (jobAnalysisResponse.ok) {
      const jobAnalysisData = await jobAnalysisResponse.json()
      if (jobAnalysisData.success) {
        results.jobAnalysis = jobAnalysisData.data
        
        // DEBUG LOGGING: API Response Analysis
        console.log('\n=== DEBUG: Job Analysis API Response ===')
        console.log('Response Status: SUCCESS')
        console.log('Company Name:', results.jobAnalysis.companyName)
        console.log('Title:', results.jobAnalysis.title)
        console.log('Salary Range:', results.jobAnalysis.salaryRange)
        console.log('Has Company Info:', !!results.jobAnalysis.companyInfo)
        console.log('Company Info Length:', results.jobAnalysis.companyInfo?.length || 0)
        console.log('Matched Keywords Count:', results.jobAnalysis.matchedKeywords?.length || 0)
        console.log('Unmatched Keywords Count:', results.jobAnalysis.unmatchedKeywords?.length || 0)
        console.log('✅ No resume modification - using source resume directly')
        
        console.log('Job analysis completed successfully')
      } else {
        console.error('Job analysis failed:', jobAnalysisData.error)
      }
    } else {
      console.error('Job analysis API call failed:', jobAnalysisResponse.status)
    }

    // Step 2: Generate cover letter outline using company info from Step 1
    console.log('Step 2: Generating cover letter outline...')
    const companyInfo = results.jobAnalysis?.companyInfo || ''
    
    const coverLetterResponse = await fetch(`${baseUrl}/api/ai?service=cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription: job.jobDescription,
        companyInfo: companyInfo,
        prompt: config.coverLetterPrompt,
        model: config.selectedModel
      })
    })

    if (coverLetterResponse.ok) {
      const coverLetterData = await coverLetterResponse.json()
      if (coverLetterData.success) {
        results.coverLetterOutline = coverLetterData.data.coverLetterOutline
        console.log('Cover letter outline generated')
      } else {
        console.error('Cover letter generation failed:', coverLetterData.error)
      }
    } else {
      console.error('Cover letter API call failed:', coverLetterResponse.status)
    }

    // Step 3: Update job with all AI-generated content
    console.log('Step 3: Updating job with AI results...')
    const updateData: any = {}

    if (results.jobAnalysis) {
      if (results.jobAnalysis.companyName) updateData.companyName = results.jobAnalysis.companyName
      if (results.jobAnalysis.title) updateData.title = results.jobAnalysis.title
      if (results.jobAnalysis.salaryRange) updateData.providedSalaryRange = results.jobAnalysis.salaryRange
      if (results.jobAnalysis.companyInfo) updateData.jobInfo = results.jobAnalysis.companyInfo
      
      // Always save the source resume (no AI modification)
      console.log('\n=== DEBUG: Database Save Resume Processing ===')
      console.log('Using source resume directly (no AI modification)')
      console.log('Resume Format:', resumeFormat)
      console.log('Resume Content Length:', resumeContent?.length || 0)
      
      if (resumeContent) {
        updateData.jobResume = resumeContent
        console.log('AI Processor: Saving source resume to database')
        
        // Log resume format info
        if (resumeFormat === 'structured') {
          try {
            const parsedResume = JSON.parse(resumeContent)
            console.log('Source Resume Sections:', Object.keys(parsedResume))
            console.log('Experience Entries:', parsedResume.experience?.length || 0)
            console.log('Certifications:', parsedResume.certifications?.length || 0)
            console.log('Education Entries:', parsedResume.education?.length || 0)
          } catch (parseError) {
            console.log('Resume stored as text format')
          }
        } else {
          console.log('Resume stored as text format')
        }
      } else {
        console.error('🚨 NO SOURCE RESUME CONTENT TO SAVE!')
      }
      
      // Handle keyword arrays - serialize to JSON strings for database storage
      if (results.jobAnalysis.matchedKeywords && Array.isArray(results.jobAnalysis.matchedKeywords)) {
        updateData.matchedKeywords = JSON.stringify(results.jobAnalysis.matchedKeywords)
        console.log('AI Processor: Saving', results.jobAnalysis.matchedKeywords.length, 'matched keywords')
      }
      
      if (results.jobAnalysis.unmatchedKeywords && Array.isArray(results.jobAnalysis.unmatchedKeywords)) {
        updateData.unmatchedKeywords = JSON.stringify(results.jobAnalysis.unmatchedKeywords)
        console.log('AI Processor: Saving', results.jobAnalysis.unmatchedKeywords.length, 'unmatched keywords')
      }
    }

    if (results.coverLetterOutline) {
      updateData.coverLetterOutline = results.coverLetterOutline
    }

    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      await prisma.job.update({
        where: { id: jobId },
        data: updateData
      })
      console.log('Job updated with AI results')
    } else {
      console.warn('No AI results to update in database')
    }

    return {
      success: true,
      results
    }

  } catch (error) {
    console.error('AI processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Gets the current configuration from the database
 * @returns Configuration object or null if not found
 */
export async function getConfiguration(): Promise<Configuration | null> {
  try {
    const config = await prisma.configuration.findFirst()
    return config as Configuration | null
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return null
  }
}

/**
 * Processes a job with AI using the current configuration
 * @param jobId - The job ID to process
 * @returns Processing result
 */
export async function processJobWithCurrentConfig(jobId: string): Promise<AIProcessingResult> {
  console.log('AI Processor: Getting configuration...')
  const config = await getConfiguration()
  
  if (!config) {
    console.error('AI Processor: No configuration found in database')
    return {
      success: false,
      error: 'Configuration not found. Please set up your configuration first.'
    }
  }

  console.log('AI Processor: Configuration found', {
    hasSourceResume: !!config.sourceResume,
    hasResumePrompt: !!config.resumePrompt,
    hasCoverLetterPrompt: !!config.coverLetterPrompt,
    selectedModel: config.selectedModel
  })

  if (!config.sourceResume || !config.resumePrompt || !config.coverLetterPrompt) {
    console.error('AI Processor: Incomplete configuration')
    return {
      success: false,
      error: 'Incomplete configuration. Please ensure source resume and both prompts are configured.'
    }
  }

  console.log('AI Processor: Configuration valid, starting AI processing...')
  return processJobWithAI(jobId, config)
}