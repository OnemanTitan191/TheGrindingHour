import React, { useState, useEffect } from 'react'
import { apiClient, AuditResponse } from '../api/client'

export const AuditPage: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [audit, setAudit] = useState<AuditResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAudit()
  }, [year])

  const fetchAudit = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getAudit(year)
      setAudit(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load audit data')
    } finally {
      setLoading(false)
    }
  }

  const getRowColor = (discrepancy: boolean, delta: number) => {
    if (!discrepancy) return 'bg-green-900 border-green-700'
    if (Math.abs(delta) < 2) return 'bg-yellow-900 border-yellow-700'
    return 'bg-red-900 border-red-700'
  }

  const getTextColor = (discrepancy: boolean, delta: number) => {
    if (!discrepancy) return 'text-green-200'
    if (Math.abs(delta) < 2) return 'text-yellow-200'
    return 'text-red-200'
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Audit Comparison</h2>
        <p className="text-slate-400">
          Compare official Tekion records vs manual labor log entries to identify discrepancies
        </p>
      </div>

      {/* Year Selector */}
      <div className="flex gap-4">
        <label className="text-white font-medium">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 hover:border-blue-400 transition-colors"
        >
          {[2026, 2025, 2024, 2023].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {audit && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-750 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Tekion Total</p>
            <p className="text-2xl font-bold text-white">{audit.totals.tekion_total}</p>
            <p className="text-xs text-slate-500">flag hours</p>
          </div>
          <div className="bg-slate-750 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Manual Total</p>
            <p className="text-2xl font-bold text-white">{audit.totals.manual_total}</p>
            <p className="text-xs text-slate-500">flag hours</p>
          </div>
          <div className="bg-slate-750 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Delta</p>
            <p className={`text-2xl font-bold ${audit.totals.total_delta >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {audit.totals.total_delta >= 0 ? '+' : ''}{audit.totals.total_delta}
            </p>
            <p className="text-xs text-slate-500">hours</p>
          </div>
          <div className="bg-slate-750 border border-slate-600 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Discrepancy Days</p>
            <p className="text-2xl font-bold text-orange-300">{audit.totals.discrepancy_days}</p>
            <p className="text-xs text-slate-500">dates</p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading audit data...</div>
      ) : error ? (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
          {error}
        </div>
      ) : audit && audit.comparisons.length > 0 ? (
        <div className="bg-slate-750 border border-slate-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-4 py-3 text-right text-white font-semibold">Tekion Hrs</th>
                <th className="px-4 py-3 text-right text-white font-semibold">Manual Hrs</th>
                <th className="px-4 py-3 text-right text-white font-semibold">Delta</th>
                <th className="px-4 py-3 text-center text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {audit.comparisons.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-l-4 ${getRowColor(row.discrepancy, row.delta)} transition-colors`}
                >
                  <td className="px-4 py-3 text-white">{row.date}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{row.tekion_hours}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">{row.manual_hours}</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    row.delta >= 0 ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {row.delta >= 0 ? '+' : ''}{row.delta}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      row.discrepancy
                        ? 'bg-orange-800 text-orange-200'
                        : 'bg-green-800 text-green-200'
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
        <div className="text-center py-8 text-slate-400">No data available for {year}</div>
      )}

      {/* Legend */}
      <div className="bg-slate-750 border border-slate-600 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded bg-green-600 mt-1"></span>
            <div>
              <p className="text-white font-medium">Match</p>
              <p className="text-slate-400 text-xs">Tekion and manual hours align within 0.25 hrs</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded bg-yellow-600 mt-1"></span>
            <div>
              <p className="text-white font-medium">Minor Gap</p>
              <p className="text-slate-400 text-xs">Difference between 0.25 and 2 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="inline-block w-3 h-3 rounded bg-red-600 mt-1"></span>
            <div>
              <p className="text-white font-medium">Large Discrepancy</p>
              <p className="text-slate-400 text-xs">Difference greater than 2 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
