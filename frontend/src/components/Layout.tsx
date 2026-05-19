import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DataSourcesBadge } from './Header/DataSourcesBadge'

interface LayoutProps {
  children: React.ReactNode
  tab?: 'dashboard' | 'upload' | 'audit'
}

export const Layout: React.FC<LayoutProps> = ({ children, tab = 'dashboard' }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('authenticated')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">The Grinding Hour</h1>
            <p className="text-slate-400 text-sm">Labor & Efficiency Tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <DataSourcesBadge />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-700 border-t border-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
            <button
              onClick={() => navigate('/dashboard')}
              className={`py-3 px-2 font-medium transition-colors border-b-2 ${
                location.pathname === '/dashboard'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/upload')}
              className={`py-3 px-2 font-medium transition-colors border-b-2 ${
                location.pathname === '/upload'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Upload Data
            </button>
            <button
              onClick={() => navigate('/audit')}
              className={`py-3 px-2 font-medium transition-colors border-b-2 ${
                location.pathname === '/audit'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Audit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-400 text-sm">
          <p>The Grinding Hour • Labor Tracking Dashboard • v2.0.0</p>
        </div>
      </footer>
    </div>
  )
}
