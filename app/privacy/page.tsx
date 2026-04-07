import { Navbar } from '@/components/layout/Navbar'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container-page">
          <div className="prose-page">
            <p className="text-label" style={{ marginBottom: '0.75rem' }}>Legal</p>
            <h1>Privacy Policy</h1>
            <p className="prose-date">Last updated: April 2026</p>

            <h2>What we collect</h2>
            <p>When you use RatesChallenge, we collect:</p>
            <ul>
              <li>Your property details (postcode, floor area, rateable value) — to run the analysis</li>
              <li>Your email address — only if you sign in or request a report by email</li>
              <li>Basic usage data (page views, errors) — to improve the service</li>
            </ul>
            <p>We do not collect payment card details. All payments are processed by Stripe, who are PCI-DSS compliant.</p>

            <h2>How we use your data</h2>
            <ul>
              <li>To generate your comparable analysis and evidence bundle</li>
              <li>To send you your sign-in link and any reports you request</li>
              <li>To improve the accuracy of our comparable matching</li>
            </ul>
            <p>We do not sell your data. We do not share it with third parties except as described below.</p>

            <h2>Third parties</h2>
            <ul>
              <li><strong>Supabase</strong> — our database provider (EU region, GDPR compliant)</li>
              <li><strong>Stripe</strong> — payment processing (PCI-DSS Level 1)</li>
              <li><strong>Vercel</strong> — hosting and deployment</li>
            </ul>

            <h2>Data retention</h2>
            <p>
              Anonymous analyses (no sign-in) are retained for 90 days, then deleted. 
              If you have an account, your analyses are retained until you delete your account. 
              You can request deletion of your data at any time by emailing us.
            </p>

            <h2>Your rights</h2>
            <p>Under UK GDPR, you have the right to access, correct, or delete your personal data. 
            To exercise these rights, contact us at the email address below.</p>

            <h2>Cookies</h2>
            <p>
              We use only essential cookies for authentication. We do not use advertising or 
              tracking cookies.
            </p>

            <h2>Contact</h2>
            <p>For privacy queries: privacy@rateschallenge.co.uk</p>
          </div>
        </div>
      </main>
    </>
  )
}