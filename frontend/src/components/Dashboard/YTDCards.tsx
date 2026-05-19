import React from 'react'
import { SummaryResponse } from '../../api/client'
import { formatCurrency, formatHours, formatEfficiency, getEfficiencyColor } from '../../utils/format'

interface YTDCardsProps {
  data: SummaryResponse | null
  loading: boolean
}

export const YTDCards: React.FC<YTDCardsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-slate-700 rounded-lg p-6 animate-pulse h-32"></div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const efficiencyColor = getEfficiencyColor(data.efficiency_pct_ytd)

  const cards = [
    {
      label: 'Flag Hours YTD',
      value: formatHours(data.flag_hours_ytd),
      color: '#5A7C5C',
      textColor: 'text-green-400',
    },
    {
      label: 'Actual Hours YTD',
      value: formatHours(data.actual_hours_ytd),
      color: '#A8A9AD',
      textColor: 'text-gray-300',
    },
    {
      label: 'Efficiency %',
      value: formatEfficiency(data.efficiency_pct_ytd),
      color: efficiencyColor,
      textColor:
        data.efficiency_pct_ytd >= 90
          ? 'text-green-400'
          : data.efficiency_pct_ytd >= 80
            ? 'text-yellow-400'
            : 'text-red-400',
    },
    {
      label: 'RO Count YTD',
      value: `${data.ro_count_ytd}`,
      color: '#F5F5F0',
      textColor: 'text-gray-900',
    },
    {
      label: 'Income Projection',
      value: formatCurrency(data.income_projection_ytd),
      color: '#F5F5F0',
      textColor: 'text-gray-900',
    },
    {
      label: 'Days Worked YTD',
      value: `${data.days_worked_ytd}`,
      color: '#A8A9AD',
      textColor: 'text-gray-300',
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-lg p-6 border border-slate-600 bg-slate-800"
            style={{ borderLeftColor: card.color, borderLeftWidth: '4px' }}
          >
            <p className="text-slate-400 text-sm font-medium mb-2">{card.label}</p>
            <p className={`font-mono text-2xl font-bold ${card.textColor}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Goal Progress Bar (full width) */}
      <div className="rounded-lg p-6 border border-slate-600 bg-slate-800 mb-6">
        <p className="text-slate-400 text-sm font-medium mb-3">Annual Goal Progress</p>
        <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
          <div
            className="h-full bg-green-600 flex items-center justify-end pr-3 transition-all duration-500"
            style={{ width: `${Math.min(data.progress_pct, 100)}%` }}
          >
            <span className="text-white font-mono text-sm font-bold">{data.progress_pct.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-2">
          {data.flag_hours_ytd.toFixed(1)} of {data.target_flag_hours} target hours
        </p>
      </div>
    </>
  )
}
