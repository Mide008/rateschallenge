import { Navbar } from '@/components/layout/Navbar'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container-page">
          <div className="prose-page">
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>Legal</p>
            <h1>Terms of Service</h1>
            <p className="prose-date">Last updated: April 2026</p>

            <h2>1. Service description</h2>
            <p>
              RatesChallenge provides data analysis tools that compare a property's rateable value 
              per m² against comparable properties from the VOA 2023 Compiled Rating List. 
              We are not a rating agent, surveyor, or legal adviser. Our analysis does not 
              constitute professional valuation advice.
            </p>

            <h2>2. Use of the service</h2>
            <p>You may use RatesChallenge to:</p>
            <ul>
              <li>Check whether your business rates assessment may be higher than comparable properties</li>
              <li>Generate evidence bundles for personal use in a VOA Check and Challenge</li>
            </ul>
            <p>You may not use RatesChallenge to:</p>
            <ul>
              <li>Provide services to third parties using our output without our written consent</li>
              <li>Scrape, copy, or redistribute our comparable data at scale</li>
              <li>Submit misleading information to the VOA</li>
            </ul>

            <h2>3. Accuracy</h2>
            <p>
              Our data is sourced from the VOA 2023 Compiled Rating List, which is publicly available. 
              We make no warranty as to the accuracy, completeness, or fitness for purpose of the analysis. 
              Actual outcomes from a Check and Challenge may differ from our estimates.
            </p>

            <h2>4. Payments and refunds</h2>
            <p>
              Payments are one-off and non-refundable once an analysis has been generated and delivered. 
              If there is a technical failure on our part that prevents delivery, we will refund in full.
            </p>

            <h2>5. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, RatesChallenge is not liable for any losses 
              arising from your use of our analysis, including the outcome of any Challenge or 
              Appeal submitted to the VOA or Valuation Tribunal.
            </p>

            <h2>6. Governing law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>

            <h2>7. Contact</h2>
            <p>For terms queries: legal@rateschallenge.co.uk</p>
          </div>
        </div>
      </main>
    </>
  )
}