import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

export const metadata = {
  title: 'How to Challenge Your Business Rates — Complete Guide',
  description: 'A step-by-step guide to challenging your business rates assessment using the VOA Check and Challenge process.',
}

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container-page">
          <div className="prose-page">
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>Challenge guide</p>
            <h1>How to Challenge Your Business Rates</h1>
            <p className="prose-date">Last updated: April 2026 · England only</p>

            <p>
              If you believe your business rates assessment is too high, you have the right to 
              challenge it through the VOA's Check, Challenge, Appeal (CCA) process. This guide 
              explains how — in plain English.
            </p>

            <h2>Step 1 — Find your rateable value</h2>
            <p>
              Your rateable value (RV) is on your business rates bill from your local council. 
              It is also searchable at{' '}
              <a href="https://www.gov.uk/find-business-rates" target="_blank" rel="noopener noreferrer">
                gov.uk/find-business-rates
              </a>. 
              Note: the RV is not the amount you pay — your actual rates bill is the RV multiplied 
              by the government's multiplier (51.2p in 2024/25).
            </p>

            <h2>Step 2 — Compare your RV/m²</h2>
            <p>
              The most common ground for a successful challenge is that your property is assessed 
              at a higher rateable value per m² than comparable properties nearby. Use RatesChallenge 
              to run this comparison against the official VOA dataset instantly.
            </p>
            <p>
              A significant challenge case typically involves being in the top 30–40% of RV/m² 
              for comparable properties in your area.
            </p>

            <h2>Step 3 — Raise a Check</h2>
            <p>
              Before you can formally challenge, you must first raise a Check. This is a factual 
              review of your property's details — floor area, description, and extent.
            </p>
            <ul>
              <li>Go to <a href="https://www.gov.uk/guidance/check-and-challenge-your-business-rates-valuation" target="_blank" rel="noopener noreferrer">the VOA Check and Challenge portal</a></li>
              <li>Create a Government Gateway account if you don't have one</li>
              <li>Search for your property and select it</li>
              <li>Review the details and submit your Check</li>
              <li>The VOA has 12 months to respond to a Check</li>
            </ul>

            <h2>Step 4 — Raise a Challenge</h2>
            <p>
              If you disagree with the outcome of the Check (or if no changes were made and you 
              still believe the assessment is wrong), you can raise a formal Challenge within 4 months 
              of the Check being closed.
            </p>
            <p>
              This is where your evidence bundle from RatesChallenge is most useful. You can upload 
              comparable evidence to support your case that the RV should be lower.
            </p>

            <h2>Step 5 — Appeal to the Valuation Tribunal</h2>
            <p>
              If the Challenge is unsuccessful and you still disagree, you can appeal to the 
              independent Valuation Tribunal for England (VTE) within 4 months of the Challenge 
              decision. This is a formal legal process — for significant cases, consider engaging 
              a RICS-accredited rating surveyor.
            </p>

            <h2>Key deadlines</h2>
            <ul>
              <li>The 2023 Rating List runs until at least 2026</li>
              <li>Checks and Challenges must be raised before the list closes</li>
              <li>Do not delay — there is no benefit to waiting</li>
            </ul>

            <h2>Do I need a surveyor?</h2>
            <p>
              For small to medium rateable values (under ~£50,000), many ratepayers successfully 
              handle their own Check and Challenge using comparable evidence. For larger assessments, 
              or where the VOA disputes your evidence, a RICS-accredited rating surveyor can 
              significantly improve your chances. Most charge a percentage of first-year savings only 
              if they win — typically 25–35%.
            </p>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.5rem', borderRadius: 8, border: '1px solid var(--accent-border)', background: 'var(--accent-subtle)' }}>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--accent)', marginBottom: '0.5rem' }}>
                Start with a free comparable check
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.875rem', lineHeight: 1.6 }}>
                Enter your postcode to see in 60 seconds whether you have grounds to challenge.
              </p>
              <Link href="/check" style={{
                display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1.125rem',
                borderRadius: 6, fontSize: '0.9375rem', fontWeight: 500,
                background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              }}>
                Check my property free
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}