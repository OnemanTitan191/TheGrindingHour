import React, { useState, useEffect } from 'react'
import { apiClient, LaborRate } from '../api/client'

interface UploadResult {
  fileName: string
  status: 'success' | 'error'
  message: string
  inserted?: number
  yearRange?: string
}

interface UploadPageProps {
  onUploadComplete?: () => void
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUploadComplete }) => {
  const [uploads, setUploads] = useState<UploadResult[]>([])
  const [loading, setLoading] = useState(false)

  // Labor Rates panel state
  const [ratesOpen, setRatesOpen] = useState(false)
  const [rates, setRates] = useState<LaborRate[]>([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newRate, setNewRate] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [rateError, setRateError] = useState<string | null>(null)

  const loadRates = async () => {
    setRatesLoading(true)
    try {
      const data = await apiClient.getRates()
      setRates(data)
    } catch {
      // silent
    } finally {
      setRatesLoading(false)
    }
  }

  useEffect(() => {
    if (ratesOpen) loadRates()
  }, [ratesOpen])

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault()
    const rateVal = parseFloat(newRate)
    if (!newDate || isNaN(rateVal) || rateVal <= 0) {
      setRateError('Date and a valid rate are required')
      return
    }
    setRateError(null)
    try {
      await apiClient.addRate(newDate, rateVal, newNotes || undefined)
      setNewDate('')
      setNewRate('')
      setNewNotes('')
      await loadRates()
    } catch (err: any) {
      setRateError(err.response?.data?.detail || 'Failed to add rate')
    }
  }

  const handleDeleteRate = async (id: number) => {
    try {
      await apiClient.deleteRate(id)
      await loadRates()
    } catch (err: any) {
      setRateError(err.response?.data?.detail || 'Failed to delete rate')
    }
  }

  const currentRate = rates.length > 0 ? rates[rates.length - 1] : null

  const handleFileUpload = async (file: File, uploadType: 'tech-report' | 'labor-log') => {
    if (!file.name.endsWith('.xlsx')) {
      setUploads(prev => [...prev, {
        fileName: file.name,
        status: 'error',
        message: 'File must be .xlsx format'
      }])
      return
    }

    setLoading(true)
    try {
      const result = await apiClient.uploadFile(file, uploadType)

      setUploads(prev => [...prev, {
        fileName: file.name,
        status: 'success',
        message: `Imported ${result.inserted} records (${result.year_range})`,
        inserted: result.inserted,
        yearRange: result.year_range
      }])

      onUploadComplete?.()

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Upload failed'
      setUploads(prev => [...prev, {
        fileName: file.name,
        status: 'error',
        message: errorMsg
      }])
    } finally {
      setLoading(false)
    }
  }

  const UploadZone = ({
    title,
    type,
    description
  }: {
    title: string
    type: 'tech-report' | 'labor-log'
    description: string
  }) => {
    const [dragActive, setDragActive] = useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0], type)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) handleFileUpload(e.target.files[0], type)
    }

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-erebor-gold bg-erebor-surface2'
            : 'border-erebor-border hover:border-erebor-gold-dim bg-erebor-surface'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />
        <div className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-erebor-gold-dim mb-1">{title}</div>
        <div className="text-xs text-erebor-rune">{description}</div>
        <div className="text-xs text-erebor-rune mt-2">
          {loading ? 'Uploading...' : 'Drag here or click to browse'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadZone
          title="Technician Report"
          type="tech-report"
          description="Job-level flag hours, pay type, wage rates (2024–2026)"
        />
        <UploadZone
          title="Labor Log"
          type="labor-log"
          description="Personal RO log — 2025 or 2026 Kia Labor Tracking.xlsx"
        />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs px-3 py-1.5 rounded bg-erebor-surface2 border border-erebor-border"
            >
              <span className="truncate text-erebor-parchment-dim mr-2">{upload.fileName}</span>
              <span className={upload.status === 'success' ? 'text-green-400/80' : 'text-red-400/80'}>
                {upload.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Labor Rates Panel */}
      <div className="bg-erebor-surface border border-erebor-border rounded">
        <button
          onClick={() => setRatesOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-erebor-surface2 transition-colors"
        >
          <span className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">
            Labor Rates
          </span>
          <span className="text-erebor-rune text-xs">{ratesOpen ? '▲' : '▼'}</span>
        </button>

        {ratesOpen && (
          <div className="px-4 pb-4 border-t border-erebor-border space-y-3 pt-3">
            {currentRate && (
              <p className="text-xs text-erebor-gold">
                Current: ${currentRate.rate.toFixed(2)}/hr
                <span className="text-erebor-rune ml-1">(effective {currentRate.effective_date})</span>
              </p>
            )}

            {ratesLoading ? (
              <p className="text-xs text-erebor-rune">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-erebor-border">
                      <th className="text-left py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">Effective Date</th>
                      <th className="text-right py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">Rate</th>
                      <th className="text-left py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">Notes</th>
                      <th className="w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-erebor-border/40">
                    {rates.map(r => (
                      <tr key={r.id} className="hover:bg-erebor-surface2/50 transition-colors">
                        <td className="py-1.5 pr-3 text-erebor-parchment tabular-nums">{r.effective_date}</td>
                        <td className="py-1.5 pr-3 text-right text-erebor-gold tabular-nums">${r.rate.toFixed(2)}/hr</td>
                        <td className="py-1.5 pr-3 text-erebor-parchment-dim">{r.notes ?? '—'}</td>
                        <td className="py-1.5 text-right">
                          <button
                            onClick={() => handleDeleteRate(r.id)}
                            className="text-erebor-rune hover:text-erebor-debit transition-colors leading-none"
                            title="Remove rate"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form onSubmit={handleAddRate} className="flex flex-wrap gap-2 pt-1">
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment focus:outline-none focus:border-erebor-mithril w-36"
              />
              <input
                type="number"
                placeholder="$/hr"
                step="0.01"
                min="0.01"
                value={newRate}
                onChange={e => setNewRate(e.target.value)}
                className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment placeholder-erebor-rune focus:outline-none focus:border-erebor-mithril w-24"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment placeholder-erebor-rune focus:outline-none focus:border-erebor-mithril flex-1 min-w-28"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-cinzel uppercase tracking-wider bg-erebor-surface2 border border-erebor-gold text-erebor-gold rounded hover:bg-erebor-gold hover:text-erebor-bg transition-colors"
              >
                Add Raise
              </button>
            </form>

            {rateError && (
              <p className="text-xs text-erebor-debit">{rateError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
