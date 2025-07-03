import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateConfigurationRequest, ApiResponse, Configuration } from '@/lib/types'

// GET /api/config - Get current configuration
export async function GET() {
  try {
    const config = await prisma.configuration.findFirst()

    return NextResponse.json<ApiResponse<Configuration | null>>({
      success: true,
      data: config
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch configuration'
    }, { status: 500 })
  }
}

// PUT /api/config - Update configuration
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateConfigurationRequest = await request.json()

    // Check if configuration exists
    const existingConfig = await prisma.configuration.findFirst()

    let config: Configuration

    if (existingConfig) {
      // Update existing configuration
      config = await prisma.configuration.update({
        where: { id: existingConfig.id },
        data: {
          sourceResume: body.sourceResume || existingConfig.sourceResume,
          resumePrompt: body.resumePrompt || existingConfig.resumePrompt,
          coverLetterPrompt: body.coverLetterPrompt || existingConfig.coverLetterPrompt,
          selectedModel: body.selectedModel || existingConfig.selectedModel
        }
      })
    } else {
      // Create new configuration
      config = await prisma.configuration.create({
        data: {
          sourceResume: body.sourceResume || '',
          resumePrompt: body.resumePrompt || '',
          coverLetterPrompt: body.coverLetterPrompt || '',
          selectedModel: body.selectedModel || 'gpt-3.5-turbo'
        }
      })
    }

    return NextResponse.json<ApiResponse<Configuration>>({
      success: true,
      data: config
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update configuration'
    }, { status: 500 })
  }
}