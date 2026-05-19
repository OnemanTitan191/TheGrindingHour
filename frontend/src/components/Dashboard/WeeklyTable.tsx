import React from 'react'
import { DailyData } from '../../api/client'
import { getEfficiencyColor, getDayOfWeekName, formatDateShort } from '../../utils/format'

interface WeeklyTableProps {
  data: DailyData[] | null
  loading: boolean
}

export const WeeklyTable: React.FC<WeeklyTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <div className="animate-pulse space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-center">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
      <h3 className="text-lg font-bold text-white mb-4">Weekly Breakdown</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left py-3 px-4 text-slate-400 font-semibold">Date</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">Flag Hrs</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">Actual Hrs</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">Efficiency %</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">RO Count</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">CP / WP / IP</th>
            <th className="text-right py-3 px-4 text-slate-400 font-semibold">Week Δ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day, idx) => {
            const efficiencyColor = getEfficiencyColor(day.efficiency_pct)
            const dayName = getDayOfWeekName(day.date)
            const dateShort = formatDateShort(day.date)
            const isDeltaUp = day.week_delta >= 0

            return (
              <tr
                key={idx}
                className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <td className="py-3 px-4 text-white font-mono">
                  {dayName} {dateShort}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-100">
                  {day.flag_hours.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-100">
                  {day.actual_hours.toFixed(1)}
                </td>
                <td
                  className="py-3 px-4 text-right font-mono font-bold"
                  style={{ color: efficiencyColor }}
                >
                  {day.efficiency_pct.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-100">{day.ro_count}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-100 text-xs">
                  {day.cp_hours.toFixed(1)} / {day.wp_hours.toFixed(1)} / {day.ip_hours.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  <span className="text-slate-100">
                    {isDeltaUp ? '↑' : '↓'} {Math.abs(day.week_delta).toFixed(1)}
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
