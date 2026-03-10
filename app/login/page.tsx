'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/login?from=${encodeURIComponent(from)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.redirected) {
      window.location.href = res.url
      return
    }

    setError('Incorrect password. Please try again.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f2f1' }}>
      <div style={{ background: '#fff', padding: '40px', maxWidth: '400px', width: '100%', borderTop: '5px solid #0b0c0c' }}>
        <h1 className="govuk-heading-l">McCreath Family Tree</h1>
        <p className="govuk-body">Enter the password to access the family tree.</p>

        {error && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="password">
              Password
            </label>
            <input
              className="govuk-input"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="govuk-button"
            disabled={loading || !password}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
