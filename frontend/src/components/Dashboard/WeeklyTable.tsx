import React from 'react'
import { WeeklySummary } from '../../api/client'
import { getEfficiencyColor, formatDateShort } from '../../utils/format'

interface WeeklyTableProps {
  data: WeeklySummary[] | null
  loading: boolean
}

export const WeeklyTable: React.FC<WeeklyTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-erebor-surface rounded-lg p-6 mb-6 border border-erebor-border">
        <div className="animate-pulse space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 bg-erebor-surface2 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-erebor-surface rounded-lg p-6 mb-6 border border-erebor-border">
        <p className="text-erebor-rune text-center">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 overflow-x-auto">
      <h3 className="font-cinzel text-xs uppercase tracking-[0.2em] text-erebor-parchment-dim mb-4">Weekly Breakdown</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-erebor-border">
            <th className="text-left py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Week</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Flag Hrs</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Actual Hrs</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Efficiency %</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">RO Count</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">CP / WP / IP</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Week Δ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((week, idx) => {
            const efficiencyColor = getEfficiencyColor(week.efficiency_pct)
            const weekNum = week.week.split('-W')[1]
            const startShort = formatDateShort(week.start_date)
            const endShort = formatDateShort(week.end_date)
            const isDeltaUp = week.week_delta >= 0

            return (
              <tr
                key={idx}
                className="border-b border-erebor-border hover:bg-erebor-surface2 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="text-erebor-gold font-mono font-medium">W{weekNum}</span>
                  <span className="text-erebor-parchment-dim text-xs ml-2">{startShort} – {endShort}</span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment">
                  {week.flag_hours.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment">
                  {week.actual_hours.toFixed(1)}
                </td>
                <td
                  className="py-3 px-4 text-right tabular-nums font-medium"
                  style={{ color: efficiencyColor }}
                >
                  {week.efficiency_pct.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment">{week.ro_count}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment text-xs">
                  {week.cp_hours.toFixed(1)} / {week.wp_hours.toFixed(1)} / {week.ip_hours.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  <span className={isDeltaUp ? 'text-erebor-credit' : 'text-erebor-debit'}>
                    {isDeltaUp ? '↑' : '↓'} {Math.abs(week.week_delta).toFixed(1)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
