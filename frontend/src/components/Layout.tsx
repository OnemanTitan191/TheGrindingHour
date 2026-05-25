import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardTab } from './Dashboard/DashboardTab'
import { AuditPage } from '../pages/AuditPage'
import { UploadPage } from '../pages/UploadPage'
import { apiClient } from '../api/client'

type Tab = 'dashboard' | 'audit'

export const Layout: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showUpload, setShowUpload] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    apiClient.getHistorical()
      .then(res => {
        const years = res.years.map((y: { year: number }) => y.year).sort((a: number, b: number) => b - a)
        if (years.length > 0) {
          setAvailableYears(years)
          setSelectedYear(years[0])
        } else {
          const cur = new Date().getFullYear()
          setAvailableYears([cur, cur - 1, cur - 2, cur - 3])
        }
      })
      .catch(() => {
        const cur = new Date().getFullYear()
        setAvailableYears([cur, cur - 1, cur - 2, cur - 3])
      })
  }, [refreshKey])

  const handleLogout = () => {
    localStorage.removeItem('authenticated')
    navigate('/login')
  }

  const handleUploadComplete = () => {
    setRefreshKey(k => k + 1)
    setShowUpload(false)
  }

  const handleDownload = async () => {
    setDownloadLoading(true)
    try {
      const res = await fetch('http://localhost:8001/export/master')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const today = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `MasterTracker_${today}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed — check server logs')
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-erebor-bg">
      {/* Header */}
      <header className="border-b border-erebor-border bg-erebor-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

          {/* Left: Logo */}
          <div className="shrink-0">
            <h1 className="font-cinzel-deco text-xl text-erebor-gold tracking-widest leading-tight">The Grinding Hour</h1>
            <p className="text-erebor-rune text-[9px] font-cinzel uppercase tracking-[0.3em]">Labor & Efficiency Tracking</p>
          </div>

          {/* Center: Tab switcher + Year selector */}
          <div className="flex items-center gap-3">
            <div className="flex rounded overflow-hidden border border-erebor-border">
              {(['dashboard', 'audit'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[10px] font-cinzel uppercase tracking-widest transition-colors ${
                    activeTab === tab
                      ? 'bg-erebor-gold/20 text-erebor-gold'
                      : 'text-erebor-rune hover:text-erebor-parchment'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-erebor-surface2 border border-erebor-border rounded px-3 py-1.5 text-xs font-cinzel text-erebor-parchment focus:outline-none focus:border-erebor-gold-dim transition-colors"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUpload(v => !v)}
              className="btn-ghost"
            >
              {showUpload ? 'Close Vault' : 'Upload Data'}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="btn-gold disabled:opacity-50"
            >
              {downloadLoading ? <span className="animate-pulse">Forging...</span> : 'Download Tracker'}
            </button>
            <button onClick={handleLogout} className="btn-ghost">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Upload Panel */}
      {showUpload && (
        <div className="border-b border-erebor-border bg-erebor-surface2/60 px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <UploadPage onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard'
          ? <DashboardTab selectedYear={selectedYear} refreshKey={refreshKey} />
          : <AuditPage selectedYear={selectedYear} />
        }
      </main>

      {/* Footer */}
      <footer className="bg-erebor-surface border-t border-erebor-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-erebor-rune text-xs font-cinzel uppercase tracking-[0.2em]">The Grinding Hour • Labor Tracking Dashboard • v2.0.0</p>
        </div>
      </footer>
    </div>
  )
}
