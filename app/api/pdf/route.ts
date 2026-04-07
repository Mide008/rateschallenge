import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper functions - moved to top level (outside GET function)
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

  console.log('PDF route called, analysisId:', analysisId)

  if (!analysisId) {
    return NextResponse.json({ error: 'Missing analysisId' }, { status: 400 })
  }

  try {
    // Get analysis from database using your working db.ts
    const analysis = await queryOne(`SELECT * FROM analyses WHERE id = $1`, [analysisId])

    if (!analysis) {
      console.error('Analysis not found for id:', analysisId)
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    console.log('Analysis found, paid:', analysis.paid)

    // Check payment only if Stripe is configured
    const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_SECRET_KEY !== 'sk_test_FILL_IN_LATER'
    
    if (stripeConfigured && !analysis.paid) {
      return NextResponse.json({ error: 'Payment required' }, { status: 403 })
    }

    // Parse comparables safely
    let comparables = []
    if (analysis.comparables) {
      try {
        comparables = typeof analysis.comparables === 'string' 
          ? JSON.parse(analysis.comparables) 
          : analysis.comparables
      } catch (e) {
        console.error('Failed to parse comparables:', e)
        comparables = []
      }
    }

    console.log('Comparables count:', comparables.length)

    if (!comparables.length) {
      return NextResponse.json({ error: 'No comparables to generate PDF from' }, { status: 400 })
    }

    // Build comparables table rows safely
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
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(address)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(postcode)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">£${safeCurrency(rv)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${area > 0 ? area.toFixed(0) : 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">£${rvPerM2}</td>
        </tr>
      `
    }).join('')

    // Generate HTML for PDF
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rates Challenge Evidence Bundle</title>
  <style>
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      margin: 40px;
      line-height: 1.6;
      color: #1a1a2e;
    }
    h1 {
      color: #1a1a2e;
      border-bottom: 3px solid #1D4ED8;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #1a1a2e;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .property-details {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-box {
      background: #eef2ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #1D4ED8;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #1D4ED8;
      color: white;
    }
    .footer {
      margin-top: 40px;
      font-size: 11px;
      color: #666;
      text-align: center;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .text-right {
      text-align: right;
    }
  </style>
</head>
<body>
  <h1>Business Rates Challenge Evidence Bundle</h1>
  <p>Prepared by RatesChallenge.co.uk · ${new Date().toLocaleDateString('en-GB')}</p>
  
  <div class="property-details">
    <h2>Property Details</h2>
    <p><strong>Analysis ID:</strong> ${analysis.id}</p>
    <p><strong>Address:</strong> ${escapeHtml(analysis.full_address || analysis.postcode || 'N/A')}</p>
    <p><strong>Postcode:</strong> ${escapeHtml(analysis.postcode || 'N/A')}</p>
    <p><strong>Property Type:</strong> ${escapeHtml(analysis.description_text || 'Commercial Property')}</p>
    <p><strong>Floor Area:</strong> ${safeNumber(analysis.floor_area, 0)} m²</p>
    <p><strong>Current Rateable Value:</strong> £${safeCurrency(analysis.rateable_value)}</p>
    <p><strong>Current RV/m²:</strong> £${safeNumber(analysis.user_rv_per_m2, 2)}</p>
  </div>
  
  <div class="summary-box">
    <h2 style="margin-top: 0;">Analysis Summary</h2>
    <p><strong>Comparable properties found:</strong> ${comparables.length}</p>
    <p><strong>Median RV/m² in area:</strong> £${safeNumber(analysis.median_rv_per_m2, 2)}</p>
    <p><strong>Your percentile:</strong> ${safeNumber(analysis.percentile, 0)}th</p>
    <p><strong>Estimated overpayment on rateable value:</strong> £${safeCurrency(analysis.potential_saving)}</p>
    <p><strong>Estimated annual rates saving:</strong> £${safeCurrency((analysis.potential_saving || 0) * 0.512)}</p>
  </div>
  
  <h2>Grounds for Challenge</h2>
  <p>The subject property at ${escapeHtml(analysis.full_address || analysis.postcode)} has a current rateable value of £${safeCurrency(analysis.rateable_value)} on the 2023 Rating List, equating to £${safeNumber(analysis.user_rv_per_m2, 2)} per m².</p>
  <p>Analysis of ${comparables.length} comparable properties of similar type (${escapeHtml(analysis.description_text || 'Commercial')}) and size (±30% floor area) within the same postcode sector reveals a median rateable value of £${safeNumber(analysis.median_rv_per_m2, 2)} per m².</p>
  <p>The subject property is assessed at the ${safeNumber(analysis.percentile, 0)}th percentile of comparable properties, suggesting that its rateable value may be disproportionately high relative to similar properties in the locality.</p>
  <p>On the basis of this comparable evidence, a rateable value in the range of £${safeCurrency((analysis.median_rv_per_m2 || 0) * (analysis.floor_area || 0) * 0.9)} – £${safeCurrency((analysis.median_rv_per_m2 || 0) * (analysis.floor_area || 0) * 1.1)} would appear more consistent with the locality evidence.</p>
  
  <h2>Comparable Evidence Table</h2>
  <p>The following ${comparables.length} properties were identified as comparable to the subject property:</p>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th>Address</th>
        <th>Postcode</th>
        <th class="text-right">RV (£)</th>
        <th class="text-right">Area (m²)</th>
        <th class="text-right">£/m²</th>
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

    // Return as HTML that can be printed to PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="rates-challenge-${analysis.postcode || analysis.id}.html"`,
      },
    })

  } catch (err: any) {
    console.error('PDF generation error:', err.message, err.stack)
    return NextResponse.json({ error: 'PDF failed: ' + err.message }, { status: 500 })
  }
}