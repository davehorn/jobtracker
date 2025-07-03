import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'
import { processJobWithCurrentConfig } from '@/lib/ai-processor'

/**
 * POST /api/jobs/process-ai - Process a job through all AI services
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()

    if (!jobId) {
      console.error('AI Processing: No job ID provided')
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 })
    }

    console.log('AI Processing: Starting for job ID:', jobId)
    
    // Process the job with AI using current configuration
    const result = await processJobWithCurrentConfig(jobId)
    
    console.log('AI Processing: Result:', {
      success: result.success,
      error: result.error,
      hasResults: !!result.results
    })

    if (result.success) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          message: 'AI processing completed successfully',
          results: result.results
        }
      })
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'AI processing failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('AI processing endpoint error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during AI processing'
    }, { status: 500 })
  }
}