import React from 'react'
import { MonthlyResponse } from '../../api/client'
import { formatCurrency, getEfficiencyColor } from '../../utils/format'

interface MonthlyChartProps {
  data: MonthlyResponse | null
  loading: boolean
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 h-64 animate-pulse border border-erebor-border"></div>
    )
  }

  if (!data || data.months.length === 0) {
    return (
      <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 border border-erebor-border">
        <p className="text-erebor-rune text-center">No data available</p>
      </div>
    )
  }

  const activeMonths = data.months.filter(m =>
    m.flag_hours > 0 || m.actual_hours > 0 || m.cp_amount > 0 || m.wp_amount > 0 || m.ip_amount > 0
  )

  return (
    <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 overflow-x-auto border border-erebor-border">
      <h3 className="font-cinzel text-xs uppercase tracking-[0.2em] text-erebor-parchment-dim mb-4">Monthly Overview</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-erebor-border">
            <th className="text-left py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Month</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Flag Hrs</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Actual Hrs</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Efficiency %</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">CP</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Warranty</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Internal</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Total Income</th>
          </tr>
        </thead>
        <tbody>
          {activeMonths.map((month, idx) => {
            const efficiencyColor = getEfficiencyColor(month.efficiency_pct)
            const totalIncome = month.cp_amount + month.wp_amount + month.ip_amount

            return (
              <tr
                key={idx}
                className="border-b border-erebor-border hover:bg-erebor-surface2 transition-colors"
              >
                <td className="py-3 px-4 text-erebor-parchment font-medium">{month.month}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment">{month.flag_hours.toFixed(1)}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-parchment">{month.actual_hours.toFixed(1)}</td>
                <td
                  className="py-3 px-4 text-right tabular-nums font-medium"
                  style={{ color: efficiencyColor }}
                >
                  {month.efficiency_pct.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-gold text-xs">{formatCurrency(month.cp_amount)}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-debit text-xs">{formatCurrency(month.wp_amount)}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-mithril text-xs">{formatCurrency(month.ip_amount)}</td>
                <td className="py-3 px-4 text-right tabular-nums text-erebor-credit font-medium">{formatCurrency(totalIncome)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
