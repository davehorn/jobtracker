import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateJobRequest, ApiResponse, Job } from '@/lib/types'

// GET /api/jobs/[id] - Get specific job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id }
    })

    if (!job) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Job not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<Job>>({
      success: true,
      data: job
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch job'
    }, { status: 500 })
  }
}

// PUT /api/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateJobRequest = await request.json()
    
    // Handle status-specific logic
    const updateData: any = { ...body }
    
    if (body.status === 'applied' && !updateData.appliedDate) {
      updateData.appliedDate = new Date()
    }
    
    if ((body.status === 'closed' || body.status === 'rejected') && !updateData.closedDate) {
      updateData.closedDate = new Date()
    }

    const job = await prisma.job.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json<ApiResponse<Job>>({
      success: true,
      data: job
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update job'
    }, { status: 500 })
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.job.delete({
      where: { id }
    })

    return NextResponse.json<ApiResponse>({
      success: true
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete job'
    }, { status: 500 })
  }
}