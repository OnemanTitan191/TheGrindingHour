import React, { useState, useEffect, useCallback } from 'react'
import { apiClient, DailyData, ManualEntry } from '../../api/client'
import { getCurrentWeek, getEfficiencyColor, offsetWeek, weekLabel } from '../../utils/format'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export const LaborTrackingTile: React.FC = () => {
  const currentWeek = getCurrentWeek()
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)
  const isCurrentWeek = selectedWeek === currentWeek

  const [tileWeekData, setTileWeekData] = useState<DailyData[] | null>(null)
  const [loadingTile, setLoadingTile] = useState(true)

  const [entries, setEntries] = useState<ManualEntry[]>([])
  const [weekTotal, setWeekTotal] = useState(0)
  const [loadingEntries, setLoadingEntries] = useState(true)

  const [formDate, setFormDate] = useState(todayISO())
  const [roNumber, setRoNumber] = useState('')
  const [flagHours, setFlagHours] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadData = useCallback(async (week: string) => {
    setLoadingTile(true)
    setLoadingEntries(true)
    try {
      const [weeklyRes, entriesRes] = await Promise.all([
        apiClient.getWeekly(week),
        apiClient.getManualEntries(week),
      ])
      setTileWeekData(weeklyRes)
      setEntries(entriesRes.entries)
      setWeekTotal(entriesRes.total_flag_hours)
    } catch {
      // silent — tile still functional
    } finally {
      setLoadingTile(false)
      setLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    loadData(selectedWeek)
  }, [selectedWeek, loadData])

  const totalFlagHours = tileWeekData?.reduce((sum, d) => sum + d.flag_hours, 0) ?? 0
  const totalActualHours = tileWeekData?.reduce((sum, d) => sum + d.actual_hours, 0) ?? 0
  const efficiency = totalActualHours > 0 ? (totalFlagHours / totalActualHours) * 100 : 0
  const weekDelta = tileWeekData && tileWeekData.length > 0 ? tileWeekData[tileWeekData.length - 1].week_delta : 0
  const efficiencyColor = getEfficiencyColor(efficiency)
  const isDeltaUp = weekDelta >= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hrs = parseFloat(flagHours)
    if (!roNumber.trim() || isNaN(hrs) || hrs <= 0) {
      setSubmitError('RO# and valid flag hours are required')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await apiClient.submitManualEntry(formDate, roNumber.trim(), hrs)
      setRoNumber('')
      setFlagHours('')
      await loadData(selectedWeek)
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Failed to add entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await apiClient.deleteManualEntry(id)
      await loadData(selectedWeek)
    } catch {
      // silent
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-erebor-surface border border-erebor-border border-t-2 border-t-erebor-gold rounded px-5 py-4">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">
          Labor Tracking
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedWeek(offsetWeek(selectedWeek, -1))}
            className="text-erebor-rune hover:text-erebor-parchment transition-colors px-1 leading-none text-sm"
            title="Previous week"
          >
            ‹
          </button>
          <span className="font-cinzel text-[8px] uppercase tracking-[0.15em] text-erebor-gold-dim tabular-nums min-w-[7rem] text-center">
            {weekLabel(selectedWeek)}
          </span>
          <button
            onClick={() => setSelectedWeek(offsetWeek(selectedWeek, 1))}
            disabled={isCurrentWeek}
            className="text-erebor-rune hover:text-erebor-parchment transition-colors px-1 leading-none text-sm disabled:opacity-30 disabled:cursor-default"
            title="Next week"
          >
            ›
          </button>
        </div>
      </div>

      {/* Tekion KPI Strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-erebor-surface2 rounded px-3 py-2 border border-erebor-border">
          <p className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-parchment-dim mb-1">This Week (Tekion)</p>
          {loadingTile ? (
            <div className="h-5 bg-erebor-surface rounded animate-pulse w-16 mt-1"></div>
          ) : (
            <p className="text-lg tabular-nums text-erebor-gold font-light">
              {tileWeekData ? `${totalFlagHours.toFixed(1)} hrs` : '—'}
            </p>
          )}
        </div>
        <div className="bg-erebor-surface2 rounded px-3 py-2 border border-erebor-border">
          <p className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-parchment-dim mb-1">Efficiency</p>
          {loadingTile ? (
            <div className="h-5 bg-erebor-surface rounded animate-pulse w-16 mt-1"></div>
          ) : (
            <p className="text-lg tabular-nums font-light" style={{ color: tileWeekData ? efficiencyColor : '#5a6a7a' }}>
              {tileWeekData ? `${efficiency.toFixed(1)}%` : '—'}
            </p>
          )}
        </div>
        <div className="bg-erebor-surface2 rounded px-3 py-2 border border-erebor-border">
          <p className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-parchment-dim mb-1">Week Δ</p>
          {loadingTile ? (
            <div className="h-5 bg-erebor-surface rounded animate-pulse w-16 mt-1"></div>
          ) : tileWeekData ? (
            <p className={`text-lg tabular-nums font-light ${isDeltaUp ? 'text-erebor-credit' : 'text-erebor-debit'}`}>
              {isDeltaUp ? '↑' : '↓'} {Math.abs(weekDelta).toFixed(1)}
            </p>
          ) : (
            <p className="text-lg tabular-nums font-light text-erebor-rune">—</p>
          )}
        </div>
      </div>

      <div className="border-t border-erebor-border/60 my-3" />

      {/* Entry Form — only on current week */}
      {isCurrentWeek && (
        <>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-3">
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment focus:outline-none focus:border-erebor-mithril w-36"
            />
            <input
              type="text"
              placeholder="RO #"
              value={roNumber}
              onChange={e => setRoNumber(e.target.value)}
              className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment placeholder-erebor-rune focus:outline-none focus:border-erebor-mithril w-28"
            />
            <input
              type="number"
              placeholder="Hrs"
              step="0.1"
              min="0.1"
              value={flagHours}
              onChange={e => setFlagHours(e.target.value)}
              className="bg-erebor-surface2 border border-erebor-border rounded px-2 py-1.5 text-xs text-erebor-parchment placeholder-erebor-rune focus:outline-none focus:border-erebor-mithril w-20"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 text-xs font-cinzel uppercase tracking-wider bg-erebor-surface2 border border-erebor-gold text-erebor-gold rounded hover:bg-erebor-gold hover:text-erebor-bg transition-colors disabled:opacity-40"
            >
              {submitting ? '…' : 'Add Repair Order'}
            </button>
          </form>
          {submitError && (
            <p className="text-xs text-erebor-debit mb-3">{submitError}</p>
          )}
        </>
      )}

      {/* Entries List */}
      {loadingEntries ? (
        <p className="text-xs text-erebor-rune">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-erebor-rune italic">No entries this week</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-erebor-border">
                <th className="text-left py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">Date</th>
                <th className="text-left py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">RO #</th>
                <th className="text-right py-1 pr-3 font-cinzel text-[8px] uppercase tracking-[0.2em] text-erebor-rune">Hrs</th>
                <th className="w-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-erebor-border/40">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-erebor-surface2/50 transition-colors">
                  <td className="py-1.5 pr-3 text-erebor-parchment-dim tabular-nums">{entry.date}</td>
                  <td className="py-1.5 pr-3 text-erebor-parchment">{entry.ro_number}</td>
                  <td className="py-1.5 pr-3 text-right text-erebor-parchment tabular-nums">{entry.flag_hours.toFixed(2)}</td>
                  <td className="py-1.5 text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-erebor-rune hover:text-erebor-debit transition-colors disabled:opacity-40 leading-none"
                      title="Remove entry"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-erebor-gold tabular-nums">
              Week total: {weekTotal.toFixed(2)} hrs
            </p>
            {isCurrentWeek && (
              <button
                onClick={() => apiClient.downloadManualExport()}
                className="text-xs font-cinzel uppercase tracking-wider text-erebor-mithril hover:text-erebor-parchment transition-colors"
              >
                ↓ Download Log
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
