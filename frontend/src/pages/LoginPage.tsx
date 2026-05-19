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
      // Placeholder for actual authentication
      // In a real app, this would call an auth endpoint
      const hardcodedPassword = 'Accord#25'

      if (password === hardcodedPassword) {
        localStorage.setItem('authenticated', 'true')
        navigate('/dashboard')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">The Grinding Hour</h1>
            <p className="text-slate-400">Labor & Efficiency Tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 hover:border-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-700 rounded text-center">
            <p className="text-slate-400 text-xs">Password: <span className="font-mono font-bold text-slate-300">Accord#25</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
