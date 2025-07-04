import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateConfigurationRequest, ApiResponse, Configuration } from '@/lib/types'

// GET /api/config - Get current configuration
export async function GET() {
  try {
    console.log('[API] GET /api/config - Fetching configuration')
    const config = await prisma.configuration.findFirst()
    console.log('[API] Configuration fetched successfully:', config ? 'Found' : 'Not found')

    return NextResponse.json<ApiResponse<Configuration | null>>({
      success: true,
      data: config as Configuration | null
    })
  } catch (error) {
    console.error('[API] Error fetching configuration:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch configuration'
    }, { status: 500 })
  }
}

// PUT /api/config - Update configuration
export async function PUT(request: NextRequest) {
  try {
    console.log('[API] PUT /api/config - Updating configuration')
    const body: UpdateConfigurationRequest = await request.json()
    console.log('[API] Request body received:', {
      hasSourceResume: !!body.sourceResume,
      hasResumePrompt: !!body.resumePrompt,
      hasCoverLetterPrompt: !!body.coverLetterPrompt,
      selectedModel: body.selectedModel,
      resumeFormat: body.resumeFormat,
      hasStructuredResume: !!body.structuredResume
    })

    // Check if configuration exists
    console.log('[API] Checking for existing configuration')
    const existingConfig = await prisma.configuration.findFirst()
    console.log('[API] Existing configuration:', existingConfig ? 'Found' : 'Not found')

    let config: Configuration

    if (existingConfig) {
      console.log('[API] Updating existing configuration')
      // Update existing configuration
      config = await prisma.configuration.update({
        where: { id: existingConfig.id },
        data: {
          sourceResume: body.sourceResume || existingConfig.sourceResume,
          resumePrompt: body.resumePrompt || existingConfig.resumePrompt,
          coverLetterPrompt: body.coverLetterPrompt || existingConfig.coverLetterPrompt,
          selectedModel: body.selectedModel || existingConfig.selectedModel,
          resumeFormat: body.resumeFormat || existingConfig.resumeFormat,
          structuredResume: body.structuredResume !== undefined ? body.structuredResume : existingConfig.structuredResume
        }
      }) as Configuration
      console.log('[API] Configuration updated successfully')
    } else {
      console.log('[API] Creating new configuration')
      // Create new configuration
      config = await prisma.configuration.create({
        data: {
          sourceResume: body.sourceResume || '',
          resumePrompt: body.resumePrompt || '',
          coverLetterPrompt: body.coverLetterPrompt || '',
          selectedModel: body.selectedModel || 'gpt-3.5-turbo',
          resumeFormat: body.resumeFormat || 'text',
          structuredResume: body.structuredResume || null
        }
      }) as Configuration
      console.log('[API] Configuration created successfully')
    }

    return NextResponse.json<ApiResponse<Configuration>>({
      success: true,
      data: config as Configuration
    })
  } catch (error) {
    console.error('[API] Error updating configuration:', error)
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update configuration'
    }, { status: 500 })
  }
}