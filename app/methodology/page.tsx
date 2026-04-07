import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

export const metadata = {
  title: 'Methodology',
  description: 'How RatesChallenge calculates comparable RV/m² and identifies potential overpayments.',
}

export default function MethodologyPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container-page">
          <div className="prose-page">
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>Methodology</p>
            <h1>How we calculate your comparable analysis</h1>
            <p className="prose-date">Last updated: April 2026</p>

            <h2>The data source</h2>
            <p>
              All analysis is based on the <strong>VOA 2023 Compiled Rating List</strong>, 
              published by the Valuation Office Agency and available under the Open Government Licence. 
              We have loaded 2,193,029 property records covering England. The list was compiled 
              at the 1 April 2023 antecedent valuation date.
            </p>

            <h2>What is RV/m²?</h2>
            <p>
              Rateable value per square metre (RV/m²) is the primary metric used by rating surveyors 
              to assess whether a property's rateable value is consistent with comparable properties. 
              It is calculated by dividing the rateable value (£) by the net internal floor area (m²).
            </p>
            <p>
              Two properties of different sizes but the same use in the same location should have 
              similar RV/m² figures if the assessments are consistent. A significantly higher RV/m² 
              than comparables is the primary grounds for a Check and Challenge.
            </p>

            <h2>How comparables are selected</h2>
            <p>We use three criteria to select comparable properties:</p>
            <ul>
              <li><strong>Property type</strong> — must match your selected category (e.g. Office, Shop, Warehouse)</li>
              <li><strong>Location</strong> — same postcode sector (e.g. EC2A 2) as the primary search. If fewer than 5 results are found, we widen to the postcode district (e.g. EC2A)</li>
              <li><strong>Size</strong> — floor area within ±30% of your stated floor area</li>
            </ul>
            <p>
              We return up to 25 comparable properties, ordered by floor area (closest match first). 
              The free check shows the 3 nearest comparables. The full analysis shows all of them.
            </p>

            <h2>How the percentile is calculated</h2>
            <p>
              Your RV/m² is ranked against all comparable properties found. The percentile shows 
              what proportion of comparables have a lower RV/m² than yours. A percentile above 60 
              means your property is assessed higher than 60% of similar properties — a potential 
              indicator of overpayment.
            </p>

            <h2>The potential saving estimate</h2>
            <p>
              The potential overpayment on rateable value is calculated as:
            </p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              (Your RV/m² − Median RV/m²) × Floor area = Potential RV overpayment (£)
            </p>
            <p>
              The estimated annual rates saving is this figure multiplied by the 2024/25 standard 
              multiplier of 51.2p in the pound (0.512). This is an estimate only — actual savings 
              depend on the outcome of a formal Challenge.
            </p>

            <h2>Limitations</h2>
            <p>
              Not all properties have floor area data in the VOA list — approximately 99.97% of 
              our records do. For properties without floor area, RV/m² cannot be calculated and 
              those records are excluded from comparable searches.
            </p>
            <p>
              Our analysis uses the description text to categorise properties (e.g. "Offices And 
              Premises" → Office). In some cases the VOA description may be more specific than our 
              categories, which could affect comparable selection.
            </p>
            <p>
              This tool provides data analysis only. It does not constitute professional surveying 
              or legal advice. For high-value or complex challenges, we recommend consulting a 
              RICS-accredited rating surveyor.
            </p>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Ready to check your property?
              </p>
              <Link href="/check" style={{
                display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1.125rem',
                borderRadius: 6, fontSize: '0.9375rem', fontWeight: 500,
                background: 'var(--accent)', color: '#fff', textDecoration: 'none',
              }}>
                Start free check
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}