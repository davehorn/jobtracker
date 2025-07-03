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
  const { sourceResume, jobDescription, prompt, model = 'gpt-3.5-turbo' } = body

  if (!sourceResume || !jobDescription || !prompt) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Missing required fields: sourceResume, jobDescription, and prompt'
    }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: prompt + '\n\nYou must respond with a JSON object containing these exact fields: companyName, title, salaryRange, companyInfo, customizedResume. Make sure the JSON is valid and properly formatted.'
        },
        {
          role: 'user',
          content: `Source Resume:\n${sourceResume}\n\nJob Description:\n${jobDescription}`
        }
      ],
      temperature: 0.5,
      max_tokens: 3000
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // Clean up common JSON formatting issues
    let cleanedResponseText = responseText.trim()
    // Remove trailing commas before closing braces/brackets
    cleanedResponseText = cleanedResponseText.replace(/,(\s*[}\]])/g, '$1')
    
    // Try to parse the JSON response
    let analysisData: AIJobAnalysisResponse
    try {
      analysisData = JSON.parse(cleanedResponseText)
      
      // Validate required fields
      if (!analysisData.customizedResume) {
        throw new Error('Missing customizedResume in response')
      }
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
  } catch (error) {
    console.error('Job analysis error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to analyze job and generate resume'
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