import React, { useState, useEffect } from 'react'
import { apiClient, AuditResponse } from '../api/client'

interface AuditPageProps {
  selectedYear: number
}

export const AuditPage: React.FC<AuditPageProps> = ({ selectedYear }) => {
  const [audit, setAudit] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAudit()
  }, [selectedYear])

  const fetchAudit = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getAudit(selectedYear)
      setAudit(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load audit data')
    } finally {
      setLoading(false)
    }
  }

  const getRowColor = (discrepancy: boolean, delta: number) => {
    if (!discrepancy) return 'bg-erebor-credit-dim border-erebor-credit'
    if (Math.abs(delta) < 2) return 'bg-erebor-surface3 border-erebor-gold-dim'
    return 'bg-erebor-debit-dim border-erebor-debit'
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cinzel-deco text-2xl text-erebor-gold tracking-widest mb-2">Audit Comparison</h2>
        <p className="text-erebor-parchment-dim">
          Compare official Tekion records vs manual labor log entries to identify discrepancies
        </p>
      </div>

      {/* Summary Cards */}
      {audit && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-erebor-surface carved-border rounded-lg p-4">
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Tekion Total</p>
            <p className="text-2xl tabular-nums font-light text-erebor-parchment mt-1">{audit.totals.tekion_total}</p>
            <p className="text-xs text-erebor-rune">flag hours</p>
          </div>
          <div className="bg-erebor-surface carved-border rounded-lg p-4">
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Manual Total</p>
            <p className="text-2xl tabular-nums font-light text-erebor-parchment mt-1">{audit.totals.manual_total}</p>
            <p className="text-xs text-erebor-rune">flag hours</p>
          </div>
          <div className="bg-erebor-surface carved-border rounded-lg p-4">
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Total Delta</p>
            <p className={`text-2xl tabular-nums font-light mt-1 ${audit.totals.total_delta >= 0 ? 'text-erebor-credit' : 'text-erebor-debit'}`}>
              {audit.totals.total_delta >= 0 ? '+' : ''}{audit.totals.total_delta}
            </p>
            <p className="text-xs text-erebor-rune">hours</p>
          </div>
          <div className="bg-erebor-surface carved-border rounded-lg p-4">
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Discrepancy Days</p>
            <p className="text-2xl tabular-nums font-light text-erebor-gold mt-1">{audit.totals.discrepancy_days}</p>
            <p className="text-xs text-erebor-rune">dates</p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {loading ? (
        <div className="text-center py-8 text-erebor-rune font-cinzel text-xs uppercase tracking-[0.2em]">Loading audit data...</div>
      ) : error ? (
        <div className="bg-erebor-debit-dim border border-erebor-debit rounded-lg p-4 text-erebor-parchment-dim">
          {error}
        </div>
      ) : audit && audit.comparisons.length > 0 ? (
        <div className="bg-erebor-surface carved-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-erebor-surface2 border-b border-erebor-border">
              <tr>
                <th className="px-4 py-3 text-left font-cinzel text-[9px] uppercase tracking-[0.2em] text-erebor-parchment-dim">Date</th>
                <th className="px-4 py-3 text-right font-cinzel text-[9px] uppercase tracking-[0.2em] text-erebor-parchment-dim">Tekion Hrs</th>
                <th className="px-4 py-3 text-right font-cinzel text-[9px] uppercase tracking-[0.2em] text-erebor-parchment-dim">Manual Hrs</th>
                <th className="px-4 py-3 text-right font-cinzel text-[9px] uppercase tracking-[0.2em] text-erebor-parchment-dim">Delta</th>
                <th className="px-4 py-3 text-center font-cinzel text-[9px] uppercase tracking-[0.2em] text-erebor-parchment-dim">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-erebor-border">
              {audit.comparisons.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-l-4 ${getRowColor(row.discrepancy, row.delta)} transition-colors`}
                >
                  <td className="px-4 py-3 text-erebor-parchment tabular-nums">{row.date}</td>
                  <td className="px-4 py-3 text-right text-erebor-parchment tabular-nums">{row.tekion_hours}</td>
                  <td className="px-4 py-3 text-right text-erebor-parchment tabular-nums">{row.manual_hours}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${
                    row.delta >= 0 ? 'text-erebor-credit' : 'text-erebor-debit'
                  }`}>
                    {row.delta >= 0 ? '+' : ''}{row.delta}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-cinzel uppercase tracking-wide px-2 py-1 rounded border ${
                      row.discrepancy
                        ? 'bg-erebor-gold-dim/20 text-erebor-gold border-erebor-gold-dim/40'
                        : 'bg-erebor-credit-dim text-erebor-parchment-dim border-erebor-credit/40'
                    }`}>
                      {row.discrepancy ? '⚠ Mismatch' : '✓ Match'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-erebor-rune font-cinzel text-xs uppercase tracking-[0.2em]">No data available for {selectedYear}</div>
      )}

      {/* Legend */}
      <div className="bg-erebor-surface carved-border rounded-lg p-6">
        <h3 className="font-cinzel text-xs uppercase tracking-[0.2em] text-erebor-parchment-dim mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded mt-1 flex-shrink-0" style={{ backgroundColor: '#1e6e3c' }}></span>
            <div>
              <p className="text-erebor-parchment font-cinzel text-xs uppercase tracking-wide">Match</p>
              <p className="text-erebor-rune text-xs mt-0.5">Tekion and manual hours align within 0.25 hrs</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded mt-1 flex-shrink-0" style={{ backgroundColor: '#7a6228' }}></span>
            <div>
              <p className="text-erebor-parchment font-cinzel text-xs uppercase tracking-wide">Minor Gap</p>
              <p className="text-erebor-rune text-xs mt-0.5">Difference between 0.25 and 2 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded mt-1 flex-shrink-0" style={{ backgroundColor: '#a02828' }}></span>
            <div>
              <p className="text-erebor-parchment font-cinzel text-xs uppercase tracking-wide">Large Discrepancy</p>
              <p className="text-erebor-rune text-xs mt-0.5">Difference greater than 2 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
