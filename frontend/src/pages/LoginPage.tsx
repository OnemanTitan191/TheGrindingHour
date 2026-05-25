import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (password === 'Accord#25') {
        localStorage.setItem('authenticated', 'true')
        navigate('/dashboard')
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-erebor-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-erebor-surface2 rounded-lg shadow-2xl p-8 border border-erebor-border">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-erebor-gold" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.25 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-erebor-parchment mb-1 tracking-widest uppercase">Grinding Hour</h1>
            <p className="text-erebor-rune text-sm">Labor & Efficiency Tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-xs font-cinzel uppercase tracking-widest text-erebor-rune mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-erebor-surface3 text-erebor-parchment rounded border border-erebor-border hover:border-erebor-gold focus:border-erebor-gold focus:outline-none transition-colors font-mono"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-erebor-debit-dim/40 border border-erebor-debit rounded p-3 text-erebor-parchment-dim text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-erebor-gold/20 hover:bg-erebor-gold/30 disabled:opacity-50 text-erebor-gold border border-erebor-gold/40 font-cinzel text-xs uppercase tracking-[0.2em] py-2.5 rounded transition-colors"
            >
              {loading ? 'Signing in...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
