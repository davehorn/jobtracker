import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, AIJobAnalysisResponse, AICoverLetterResponse } from '@/lib/types'
import OpenAI from 'openai'

// Initialize OpenAI client
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Environment validation helper
function validateEnvironment() {
  if (!process.env.OPENAI_API_KEY) {
    return {
      isValid: false,
      error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
    }
  }
  return { isValid: true, error: null }
}

// AI service implementations
export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    const envCheck = validateEnvironment()
    if (!envCheck.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: envCheck.error || 'Environment validation failed'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const body = await request.json()

    const openai = getOpenAIClient()

    switch (service) {
      case 'job-analysis':
        return await handleJobAnalysis(openai, body)
      
      case 'cover-letter':
        return await handleCoverLetterGeneration(openai, body)
      
      default:
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Unknown AI service. Supported services: job-analysis, cover-letter'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('AI service error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Job analysis & resume customization service
async function handleJobAnalysis(openai: OpenAI, body: any) {
  const { sourceResume, jobDescription, prompt, model = 'gpt-3.5-turbo', resumeFormat = 'text' } = body

  if (!sourceResume || !jobDescription || !prompt) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Missing required fields: sourceResume, jobDescription, and prompt'
    }, { status: 400 })
  }

  try {
    // Adjust prompt based on resume format
    const keywordInstructions = '\n\nKEYWORD MATCHING ANALYSIS:\n1. Extract key technical skills, tools, technologies, and important qualifications from the job description\n2. Compare these keywords with the resume content\n3. Return matchedKeywords: array of keywords that appear in both the job description and resume\n4. Return unmatchedKeywords: array of important keywords from the job description that do NOT appear in the resume\n5. Focus on technical skills, certifications, tools, programming languages, frameworks, and key qualifications\n6. Be thorough but avoid generic words like "experience", "team", "work"'
    
    const systemPrompt = prompt + '\n\nYou must respond with a JSON object containing these exact fields: companyName, title, salaryRange, companyInfo, matchedKeywords, unmatchedKeywords. Make sure the JSON is valid and properly formatted.' + keywordInstructions

    // DEBUG LOGGING: Log the complete request being sent to OpenAI
    console.log('\n=== DEBUG: OpenAI Request Analysis ===')
    console.log('Model:', model)
    console.log('Resume Format:', resumeFormat)
    console.log('Source Resume Length:', sourceResume?.length || 0)
    console.log('Job Description Length:', jobDescription?.length || 0)
    console.log('User Prompt Length:', prompt?.length || 0)
    
    // Log first 500 chars of each component for verification
    console.log('\n--- System Prompt (COMPLETE - Length:', systemPrompt?.length || 0, 'chars) ---')
    console.log(systemPrompt)
    
    console.log('\n--- Source Resume (COMPLETE - Length:', sourceResume?.length || 0, 'chars) ---')
    console.log(sourceResume)
    
    console.log('\n--- Job Description (COMPLETE - Length:', jobDescription?.length || 0, 'chars) ---')
    console.log(jobDescription)
    
    // Log resume data structure if structured format
    if (resumeFormat === 'structured') {
      try {
        const resumeData = JSON.parse(sourceResume)
        console.log('\n--- Structured Resume Analysis ---')
        console.log('Experience entries:', resumeData.experience?.length || 0)
        console.log('Certifications:', resumeData.certifications?.length || 0)
        console.log('Skills categories:', resumeData.skills?.length || 0)
        console.log('Education entries:', resumeData.education?.length || 0)
        if (resumeData.certifications) {
          console.log('Certification list:', resumeData.certifications)
        }
      } catch (parseError) {
        console.warn('Could not parse structured resume for analysis:', parseError)
      }
    }

    // Pre-flight validation and logging
    console.log('\n=== DEBUG: OpenAI API Call Preparation ===')
    console.log('Model being used:', model)
    console.log('Temperature:', 0.5)
    console.log('Max tokens:', 4000)
    console.log('System prompt length:', systemPrompt?.length || 0)
    console.log('User message length:', `Source Resume (${resumeFormat} format):\n${sourceResume}\n\nJob Description:\n${jobDescription}`.length)
    
    // Model validation
    const validModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k']
    if (!validModels.includes(model)) {
      console.error('🚨 INVALID MODEL WARNING:', model, 'is not in the list of known valid models:', validModels)
      console.log('⚠️ Attempting to use model anyway - OpenAI will reject if invalid')
    } else {
      console.log('✅ Model validation passed:', model)
    }
    
    let completion
    try {
      console.log('🚀 Initiating OpenAI API call...')
      completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Source Resume (${resumeFormat} format):\n${sourceResume}\n\nJob Description:\n${jobDescription}`
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
      console.log('✅ OpenAI API call successful')
    } catch (openaiError: any) {
      console.error('\n🚨 OPENAI API ERROR DETAILS:')
      console.error('Error type:', typeof openaiError)
      console.error('Error message:', openaiError?.message || 'No message')
      console.error('Error code:', openaiError?.code || 'No code')
      console.error('Error type field:', openaiError?.type || 'No type')
      console.error('Error status:', openaiError?.status || 'No status')
      console.error('Full error object:', openaiError)
      
      // Check for specific error types
      if (openaiError?.message?.includes('model')) {
        console.error('🚨 MODEL ERROR: Invalid or unavailable model:', model)
      }
      if (openaiError?.message?.includes('token')) {
        console.error('🚨 TOKEN ERROR: Request exceeds token limits')
      }
      if (openaiError?.message?.includes('rate')) {
        console.error('🚨 RATE LIMIT ERROR: Too many requests')
      }
      if (openaiError?.status === 401) {
        console.error('🚨 AUTHENTICATION ERROR: Invalid API key')
      }
      if (openaiError?.status === 403) {
        console.error('🚨 PERMISSION ERROR: Model not available in your account')
      }
      
      // Re-throw the error to be caught by the outer try-catch
      throw openaiError
    }

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // DEBUG LOGGING: Log the complete OpenAI response
    console.log('\n=== DEBUG: OpenAI Response Analysis ===')
    console.log('Response Length:', responseText?.length || 0)
    console.log('Response Text (COMPLETE - Length:', responseText?.length || 0, 'chars):')
    console.log(responseText)
    console.log('Response Text (last 500 chars):')
    console.log(responseText.substring(Math.max(0, responseText.length - 500)))
    
    // Clean up common JSON formatting issues
    let cleanedResponseText = responseText.trim()
    
    // Handle markdown code blocks that OpenAI sometimes adds
    console.log('🧹 Cleaning response for JSON parsing...')
    
    // Check if response is wrapped in markdown code blocks
    if (cleanedResponseText.startsWith('```json')) {
      console.log('📝 Detected ```json markdown code block, stripping...')
      cleanedResponseText = cleanedResponseText.replace(/^```json\s*/, '') // Remove ```json from start
      cleanedResponseText = cleanedResponseText.replace(/\s*```\s*$/, '')   // Remove ``` from end
    } else if (cleanedResponseText.startsWith('```')) {
      console.log('📝 Detected ``` markdown code block, stripping...')
      cleanedResponseText = cleanedResponseText.replace(/^```\s*/, '')      // Remove ``` from start  
      cleanedResponseText = cleanedResponseText.replace(/\s*```\s*$/, '')   // Remove ``` from end
    }
    
    // Additional cleanup for any remaining markdown artifacts
    cleanedResponseText = cleanedResponseText.trim()
    
    // Remove trailing commas before closing braces/brackets
    cleanedResponseText = cleanedResponseText.replace(/,(\s*[}\]])/g, '$1')
    
    console.log('✅ Response cleaning complete, final length:', cleanedResponseText.length)
    
    console.log('\n--- Cleaned Response (COMPLETE - Length:', cleanedResponseText?.length || 0, 'chars) ---')
    console.log(cleanedResponseText)
    
    // Try to parse the JSON response
    let analysisData: AIJobAnalysisResponse
    try {
      analysisData = JSON.parse(cleanedResponseText)
      
      // Validate that we got a response (customizedResume is now optional)
      console.log('✅ AI response parsed successfully')
      
      // Validate keyword arrays (should be arrays, but can be empty)
      if (!Array.isArray(analysisData.matchedKeywords)) {
        console.warn('matchedKeywords is not an array, defaulting to empty array')
        analysisData.matchedKeywords = []
      }
      
      if (!Array.isArray(analysisData.unmatchedKeywords)) {
        console.warn('unmatchedKeywords is not an array, defaulting to empty array')
        analysisData.unmatchedKeywords = []
      }
      
      // DEBUG LOGGING: Validate response against restrictions
      console.log('\n=== DEBUG: AI Response Analysis ===')
      console.log('Company Name:', analysisData.companyName || 'Not provided')
      console.log('Job Title:', analysisData.title || 'Not provided')
      console.log('Salary Range:', analysisData.salaryRange || 'Not specified')
      console.log('Company Info Length:', analysisData.companyInfo?.length || 0)
      console.log('Matched keywords returned:', analysisData.matchedKeywords?.length || 0)
      console.log('Unmatched keywords returned:', analysisData.unmatchedKeywords?.length || 0)
      console.log('✅ No resume modification attempted - using source resume directly')
      
      // Resume modification validation removed - we now use source resume directly
      
      console.log('=== END DEBUG LOGGING ===\n')
    } catch (parseError) {
      // If parsing fails, return error with details
      console.error('JSON parsing failed:', parseError)
      console.error('Original response text:', responseText)
      console.error('Cleaned response text:', cleanedResponseText)
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'AI service returned invalid JSON response. Please check your prompt configuration.'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<AIJobAnalysisResponse>>({
      success: true,
      data: analysisData
    })
  } catch (error: any) {
    console.error('\n🚨 JOB ANALYSIS ERROR DETAILS:')
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message || 'No message')
    console.error('Error stack:', error?.stack || 'No stack trace')
    console.error('Full error object:', error)
    
    // Provide specific error messages based on error type
    let userFriendlyError = 'Failed to analyze job and generate resume'
    
    if (error?.message?.includes('model')) {
      userFriendlyError = `Invalid or unavailable OpenAI model: ${model}. Please check your model selection in Configuration.`
      console.error('🚨 MODEL ISSUE: User selected invalid/unavailable model')
    } else if (error?.message?.includes('token')) {
      userFriendlyError = 'Request exceeds token limits. Try using a shorter job description or resume.'
      console.error('🚨 TOKEN LIMIT: Request too large for selected model')
    } else if (error?.message?.includes('rate')) {
      userFriendlyError = 'OpenAI rate limit exceeded. Please wait a moment and try again.'
      console.error('🚨 RATE LIMIT: Too many API requests')
    } else if (error?.status === 401) {
      userFriendlyError = 'Invalid OpenAI API key. Please check your API key configuration.'
      console.error('🚨 AUTHENTICATION: Invalid API key')
    } else if (error?.status === 403) {
      userFriendlyError = `Model '${model}' is not available in your OpenAI account. Please select a different model.`
      console.error('🚨 PERMISSIONS: Model not available in user account')
    } else if (error?.code === 'insufficient_quota') {
      userFriendlyError = 'OpenAI API quota exceeded. Please check your OpenAI account billing.'
      console.error('🚨 QUOTA: OpenAI account quota exceeded')
    }
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: userFriendlyError
    }, { status: 500 })
  }
}

// Cover letter outline service
async function handleCoverLetterGeneration(openai: OpenAI, body: any) {
  const { jobDescription, companyInfo, prompt, model = 'gpt-3.5-turbo' } = body

  if (!jobDescription || !prompt) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Missing required fields: jobDescription and prompt'
    }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nCompany Information:\n${companyInfo || 'Not available'}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    const coverLetterOutline = completion.choices[0]?.message?.content || ''

    return NextResponse.json<ApiResponse<AICoverLetterResponse>>({
      success: true,
      data: { coverLetterOutline }
    })
  } catch (error) {
    console.error('Cover letter generation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to generate cover letter outline'
    }, { status: 500 })
  }
}

// GET endpoint to check API configuration status
export async function GET() {
  const envCheck = validateEnvironment()
  
  return NextResponse.json<ApiResponse>({
    success: envCheck.isValid,
    data: {
      apiConfigured: envCheck.isValid,
      message: envCheck.isValid 
        ? 'OpenAI API is properly configured'
        : 'OpenAI API configuration missing'
    },
    error: envCheck.error || undefined
  })
}