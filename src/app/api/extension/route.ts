import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExtensionJobRequest, ApiResponse } from '@/lib/types'
import { processJobWithCurrentConfig } from '@/lib/ai-processor'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  })
}

// POST /api/extension - Add job from Chrome extension
export async function POST(request: NextRequest) {
  try {
    const body: ExtensionJobRequest = await request.json()

    // Create job from extension data
    const job = await prisma.job.create({
      data: {
        jobDescriptionUrl: body.url,
        jobDescription: body.description,
        status: 'pending'
      }
    })

    // Phase 4: Trigger AI processing automatically
    try {
      console.log('Starting AI processing for extension job:', job.id)
      
      // Process the job with AI in the background
      const aiResult = await processJobWithCurrentConfig(job.id)
      
      if (aiResult.success) {
        console.log('AI processing completed for extension job:', job.id)
      } else {
        console.warn('AI processing failed for extension job:', job.id, aiResult.error)
        // Don't fail the whole request if AI processing fails
      }
    } catch (aiError) {
      console.error('AI processing error for extension job:', job.id, aiError)
      // Don't fail the whole request if AI processing fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { id: job.id, message: 'Job added successfully and AI processing initiated' }
    }, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Extension job creation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to add job from extension'
    }, { status: 500, headers: corsHeaders })
  }
}

// GET /api/extension - Health check for extension
export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { status: 'Job Tracker API is running' }
  }, { headers: corsHeaders })
}