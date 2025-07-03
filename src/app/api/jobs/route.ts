import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateJobRequest, ApiResponse, Job } from '@/lib/types'

// GET /api/jobs - List all jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const jobs = await prisma.job.findMany({
      where: status ? { status } : undefined,
      orderBy: { creationDate: 'desc' }
    })

    return NextResponse.json<ApiResponse<Job[]>>({
      success: true,
      data: jobs
    })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch jobs'
    }, { status: 500 })
  }
}

// POST /api/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const body: CreateJobRequest = await request.json()

    const job = await prisma.job.create({
      data: {
        jobDescriptionUrl: body.jobDescriptionUrl,
        jobDescription: body.jobDescription,
        status: 'pending'
      }
    })

    return NextResponse.json<ApiResponse<Job>>({
      success: true,
      data: job
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create job'
    }, { status: 500 })
  }
}