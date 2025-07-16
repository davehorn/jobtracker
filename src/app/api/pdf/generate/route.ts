import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { StructuredResume } from '@/lib/types'
import { professionalTemplate } from '@/lib/resume-templates'
import { validateStructuredResume } from '@/lib/resume-utils'

interface PDFGenerationRequest {
  resumeData: string
  companyName?: string
  jobTitle?: string
  userName?: string
}

/**
 * Generate a smart filename for the PDF export
 */
function generatePDFFilename(userName?: string, companyName?: string, jobTitle?: string): string {
  const parts = []
  
  if (userName) {
    const cleanName = userName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20)
    parts.push(cleanName)
  }
  
  parts.push('Resume')
  
  if (companyName) {
    const cleanCompany = companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20)
    parts.push(cleanCompany)
  }
  
  if (jobTitle) {
    const cleanTitle = jobTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20)
    parts.push(cleanTitle)
  }
  
  return `${parts.join('_')}.pdf`
}

/**
 * Convert resume data to HTML content
 */
function getResumeHTML(resumeData: string): string {
  console.log('[PDF-API] 🔍 Analyzing resume data format...')
  
  try {
    const parsed = JSON.parse(resumeData)
    console.log('[PDF-API] ✅ JSON parsing successful, keys:', Object.keys(parsed))
    
    if (validateStructuredResume(parsed)) {
      console.log('[PDF-API] ✅ Structured resume validation passed')
      const html = professionalTemplate.generateHTML(parsed as StructuredResume)
      console.log('[PDF-API] 📄 Generated HTML from template, length:', html.length)
      return html
    } else {
      console.log('[PDF-API] ❌ Structured resume validation failed')
    }
  } catch (error) {
    console.log('[PDF-API] ❌ JSON parsing failed:', error)
  }
  
  // Handle plain text resume
  console.log('[PDF-API] 📝 Creating plain text HTML wrapper')
  const plainHTML = `
    <div class="plain-text-resume">
      <h1>Resume</h1>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 8pt; line-height: 1.2; margin: 8px 0; color: #000000;">${resumeData}</pre>
    </div>
  `
  
  return plainHTML
}

/**
 * Create print-optimized HTML for PDF generation
 */
function createPrintHTML(htmlContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Resume</title>
      <style>
        /* ATS-Optimized Resume Styling */
        body {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          line-height: 1.2;
          color: #000000;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          box-sizing: border-box;
        }
        
        /* Name - Bold, Arial 8pt */
        h1 {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: bold;
          margin: 0 0 8px 0;
          color: #000000;
          text-align: center;
        }
        
        /* Section Headers - Bold, Arial 8pt */
        h2 {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: bold;
          margin: 12px 0 4px 0;
          color: #000000;
          text-transform: uppercase;
        }
        
        /* Sub-headers - Regular, Arial 8pt */
        h3 {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
          margin: 8px 0 2px 0;
          color: #000000;
        }
        
        /* Paragraphs - Regular, Arial 8pt */
        p {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
          margin: 0 0 4px 0;
          color: #000000;
        }
        
        /* Lists - Regular, Arial 8pt */
        ul {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          margin: 0 0 8px 0;
          padding-left: 20px;
        }
        
        li {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
          margin: 0 0 2px 0;
          color: #000000;
        }
        
        /* Contact Info - Centered, Regular */
        .contact-info {
          text-align: center;
          margin: 0 0 16px 0;
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
        }
        
        /* Section Spacing */
        .section {
          margin: 0 0 12px 0;
        }
        
        /* Clean ATS-friendly formatting */
        * {
          box-sizing: border-box;
        }
        
        .resume-preview {
          width: 100%;
        }
        
        /* Remove any decorative elements that might confuse ATS */
        .resume-preview * {
          border: none;
          background: white;
          text-decoration: none;
        }
        
        /* Ensure consistent spacing */
        .experience-item,
        .education-item,
        .project-item {
          margin: 0 0 8px 0;
        }
        
        /* Experience section improvements for readability */
        .job {
          margin: 0 0 12px 0;
          padding: 0 0 8px 0;
        }
        
        /* Bold job titles and company names for better hierarchy */
        .job h3,
        .job .company {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: bold;
          color: #000000;
        }
        
        /* Job header layout */
        .job-header {
          margin: 0 0 2px 0;
        }
        
        /* Dates styling */
        .dates {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
          color: #000000;
          margin: 0 0 4px 0;
        }
        
        /* Achievement bullets */
        .achievements {
          margin: 0 0 4px 0;
          padding-left: 20px;
        }
        
        .achievements li {
          margin: 0 0 1px 0;
        }
        
        /* Technologies line */
        .technologies {
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: normal;
          color: #000000;
          margin: 2px 0 0 0;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="resume-preview">
        ${htmlContent}
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    console.log('[PDF-API] 🚀 Starting server-side PDF generation')
    
    // Parse request body
    const body: PDFGenerationRequest = await request.json()
    const { resumeData, companyName, jobTitle, userName } = body
    
    console.log('[PDF-API] Request details:', {
      resumeLength: resumeData?.length || 0,
      companyName: companyName || 'Not provided',
      jobTitle: jobTitle || 'Not provided',
      userName: userName || 'Not provided'
    })
    
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      )
    }
    
    // Generate HTML content
    console.log('[PDF-API] 🔧 Generating resume HTML...')
    const resumeHTML = getResumeHTML(resumeData)
    const printHTML = createPrintHTML(resumeHTML)
    
    // Generate filename
    const filename = generatePDFFilename(userName, companyName, jobTitle)
    console.log('[PDF-API] 📁 Generated filename:', filename)
    
    // Launch Puppeteer
    console.log('[PDF-API] 🚀 Launching Puppeteer with system Chromium...')
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    try {
      const page = await browser.newPage()
      
      // Set content and wait for rendering
      console.log('[PDF-API] 📄 Setting page content...')
      await page.setContent(printHTML, { waitUntil: 'networkidle0' })
      
      // Generate PDF
      console.log('[PDF-API] 📄 Generating PDF with Puppeteer...')
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        preferCSSPageSize: false
      })
      
      console.log('[PDF-API] ✅ PDF generation completed successfully!')
      console.log('[PDF-API] PDF size:', pdfBuffer.length, 'bytes')
      
      // Return PDF as downloadable file
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      })
      
    } finally {
      await browser.close()
      console.log('[PDF-API] 🧹 Browser closed')
    }
    
  } catch (error) {
    console.error('[PDF-API] ❌ Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}