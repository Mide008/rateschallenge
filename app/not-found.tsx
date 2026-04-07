import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          marginBottom: '1rem',
        }}>
          404
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}>
          Page not found
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          marginBottom: '2rem',
        }}>
          This page doesn't exist or has been moved.
        </p>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.625rem 1.25rem',
          borderRadius: 8,
          fontSize: '15px',
          fontWeight: 500,
          background: 'var(--accent)',
          color: '#fff',
          textDecoration: 'none',
        }}>
          Back to home
        </Link>
      </div>
    </div>
  )
}