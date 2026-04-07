import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper functions
const escapeHtml = (str: string): string => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const safeNumber = (value: any, decimals: number = 0): string => {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return '0'
  return decimals > 0 ? num.toFixed(decimals) : num.toString()
}

const safeCurrency = (value: any): string => {
  if (value === null || value === undefined) return '0'
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (isNaN(num)) return '0'
  return num.toLocaleString('en-GB')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const analysisId = searchParams.get('analysisId')

  if (!analysisId) {
    return NextResponse.json({ error: 'Missing analysisId' }, { status: 400 })
  }

  try {
    const analysis = await queryOne(`SELECT * FROM analyses WHERE id = $1`, [analysisId])

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_SECRET_KEY !== 'sk_test_FILL_IN_LATER'
    
    if (stripeConfigured && !analysis.paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 403 })
    }

    let comparables = []
    if (analysis.comparables) {
      try {
        comparables = typeof analysis.comparables === 'string' 
          ? JSON.parse(analysis.comparables) 
          : analysis.comparables
      } catch (e) {
        comparables = []
      }
    }

    if (!comparables.length) {
      return NextResponse.json({ error: 'No comparables to generate PDF from' }, { status: 400 })
    }

    // Build comparables table rows
    const comparablesRows = comparables.slice(0, 20).map((comp: any) => {
      const address = comp.full_address || comp.address || 'Address not available'
      const postcode = comp.postcode || 'N/A'
      
      let area = 0
      let rv = 0
      let rvPerM2 = 'N/A'
      
      try {
        area = comp.total_area ? (typeof comp.total_area === 'number' ? comp.total_area : parseFloat(comp.total_area)) : 0
        rv = comp.rateable_value ? (typeof comp.rateable_value === 'number' ? comp.rateable_value : parseFloat(comp.rateable_value)) : 0
        if (area > 0 && rv > 0) {
          rvPerM2 = (rv / area).toFixed(2)
        }
      } catch (e) {
        console.error('Error processing comparable:', e)
      }
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; font-size: 10px;">${escapeHtml(address)}</td>
          <td style="padding: 8px; font-size: 10px;">${escapeHtml(postcode)}</td>
          <td style="padding: 8px; font-size: 10px; text-align: right;">£${safeCurrency(rv)}</td>
          <td style="padding: 8px; font-size: 10px; text-align: right;">${area > 0 ? area.toFixed(0) : 'N/A'}</td>
          <td style="padding: 8px; font-size: 10px; text-align: right;">£${rvPerM2}</td>
        </tr>
      `
    }).join('')

    // HTML content for PDF
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rates Challenge Evidence Bundle</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      color: #1a1a2e;
      font-size: 11px;
    }
    h1 {
      color: #1a1a2e;
      border-bottom: 3px solid #1D4ED8;
      padding-bottom: 8px;
      margin-bottom: 20px;
      font-size: 22px;
    }
    h2 {
      color: #1a1a2e;
      margin-top: 25px;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .property-details {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .summary-box {
      background: #eef2ff;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 3px solid #1D4ED8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #1D4ED8;
      color: white;
      padding: 8px;
      font-size: 9px;
      text-align: left;
    }
    td {
      padding: 6px 8px;
    }
    .footer {
      margin-top: 30px;
      font-size: 8px;
      color: #666;
      text-align: center;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .text-right {
      text-align: right;
    }
    .label {
      font-weight: bold;
      color: #374151;
    }
  </style>
</head>
<body>
  <h1>Business Rates Challenge Evidence Bundle</h1>
  <p style="color: #6b7280; margin-bottom: 25px;">Prepared by RatesChallenge.co.uk · ${new Date().toLocaleDateString('en-GB')}</p>
  
  <div class="property-details">
    <h2 style="margin-top: 0;">Property Details</h2>
    <p><span class="label">Address:</span> ${escapeHtml(analysis.full_address || analysis.postcode || 'N/A')}</p>
    <p><span class="label">Postcode:</span> ${escapeHtml(analysis.postcode || 'N/A')}</p>
    <p><span class="label">Property Type:</span> ${escapeHtml(analysis.description_text || 'Commercial Property')}</p>
    <p><span class="label">Floor Area:</span> ${safeNumber(analysis.floor_area, 0)} m²</p>
    <p><span class="label">Current Rateable Value:</span> £${safeCurrency(analysis.rateable_value)}</p>
    <p><span class="label">Current RV/m²:</span> £${safeNumber(analysis.user_rv_per_m2, 2)}</p>
  </div>
  
  <div class="summary-box">
    <h2 style="margin-top: 0;">Analysis Summary</h2>
    <p><span class="label">Comparable properties found:</span> ${comparables.length}</p>
    <p><span class="label">Median RV/m² in area:</span> £${safeNumber(analysis.median_rv_per_m2, 2)}</p>
    <p><span class="label">Your percentile:</span> ${safeNumber(analysis.percentile, 0)}th</p>
    <p><span class="label">Estimated overpayment on rateable value:</span> £${safeCurrency(analysis.potential_saving)}</p>
    <p><span class="label">Estimated annual rates saving:</span> £${safeCurrency((analysis.potential_saving || 0) * 0.512)}</p>
  </div>
  
  <h2>Grounds for Challenge</h2>
  <p>The subject property at ${escapeHtml(analysis.full_address || analysis.postcode)} has a current rateable value of <strong>£${safeCurrency(analysis.rateable_value)}</strong> on the 2023 Rating List, equating to <strong>£${safeNumber(analysis.user_rv_per_m2, 2)} per m²</strong>.</p>
  <p>Analysis of <strong>${comparables.length} comparable properties</strong> of similar type (${escapeHtml(analysis.description_text || 'Commercial')}) and size (±30% floor area) within the same postcode sector reveals a <strong>median rateable value of £${safeNumber(analysis.median_rv_per_m2, 2)} per m²</strong>.</p>
  <p>The subject property is assessed at the <strong>${safeNumber(analysis.percentile, 0)}th percentile</strong> of comparable properties, suggesting that its rateable value may be disproportionately high relative to similar properties in the locality.</p>
  
  <h2>Comparable Evidence Table</h2>
  <p>The following ${comparables.length} properties were identified as comparable to the subject property:</p>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #1D4ED8; color: white;">
        <th style="padding: 8px; text-align: left;">Address</th>
        <th style="padding: 8px; text-align: left;">Postcode</th>
        <th style="padding: 8px; text-align: right;">RV (£)</th>
        <th style="padding: 8px; text-align: right;">Area (m²)</th>
        <th style="padding: 8px; text-align: right;">£/m²</th>
      </tr>
    </thead>
    <tbody>
      ${comparablesRows}
    </tbody>
  追赶
  
  <div class="footer">
    <p><strong>Data source:</strong> Valuation Office Agency 2023 Compiled Rating List</p>
    <p>This document is for information purposes only and does not constitute legal advice.</p>
    <p>RatesChallenge provides data analysis only and is not a rating agent, surveyor, or legal adviser.</p>
    <p>For complex or high-value challenges, consult a RICS-accredited rating surveyor.</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`

    // Launch puppeteer with @sparticuz/chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        bottom: '2cm',
        left: '1.5cm',
        right: '1.5cm'
      }
    })
    
    await browser.close()
    
    // Return as PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rates-challenge-${analysis.postcode || analysis.id}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
      },
    })

  } catch (err: any) {
    console.error('PDF generation error:', err.message, err.stack)
    return NextResponse.json({ error: 'PDF failed: ' + err.message }, { status: 500 })
  }
}