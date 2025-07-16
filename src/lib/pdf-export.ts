interface PDFExportOptions {
  resumeData: string
  companyName?: string
  jobTitle?: string
  userName?: string
}

/**
 * Export resume to PDF using server-side generation
 */
export async function exportResumeToPDF({
  resumeData,
  companyName,
  jobTitle,
  userName
}: PDFExportOptions): Promise<void> {
  try {
    console.log('[PDF] 🚀 Starting server-side PDF export')
    console.log('[PDF] Resume data length:', resumeData?.length || 0)
    console.log('[PDF] Company name:', companyName || 'Not provided')
    console.log('[PDF] Job title:', jobTitle || 'Not provided')
    console.log('[PDF] User name:', userName || 'Not provided')
    
    // Make API request to server-side PDF generation
    console.log('[PDF] 📞 Calling server-side PDF generation API...')
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData,
        companyName,
        jobTitle,
        userName
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }
    
    console.log('[PDF] ✅ Server-side PDF generation completed')
    console.log('[PDF] Response size:', response.headers.get('content-length'), 'bytes')
    
    // Get the PDF blob
    const pdfBlob = await response.blob()
    console.log('[PDF] 📄 PDF blob size:', pdfBlob.size, 'bytes')
    
    // Extract filename from response headers
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'Resume.pdf'
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="([^"]+)"/)
      if (matches) {
        filename = matches[1]
      }
    }
    
    console.log('[PDF] 📁 Using filename:', filename)
    
    // Create download link and trigger download
    console.log('[PDF] 💾 Triggering PDF download...')
    const url = window.URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    console.log('[PDF] ✅ PDF download completed successfully!')
    
  } catch (error) {
    console.error('[PDF] ❌ Error generating PDF:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.')
  }
}

/**
 * Check if PDF export is supported in current browser
 */
export function isPDFExportSupported(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('[PDF] ❌ Not in browser environment')
    return false
  }
  
  // Check for required APIs (fetch and blob support)
  const hasRequiredAPIs = typeof fetch === 'function' &&
                         typeof window.Blob !== 'undefined' &&
                         typeof window.URL !== 'undefined' &&
                         typeof window.URL.createObjectURL === 'function'
  
  if (!hasRequiredAPIs) {
    console.log('[PDF] ❌ Missing required browser APIs')
    return false
  }
  
  console.log('[PDF] ✅ Browser environment supports PDF export (server-side)')
  return true
}