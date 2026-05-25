import React from 'react'
import { IncomeResponse } from '../../api/client'
import { formatCurrency } from '../../utils/format'

interface IncomeProjectionProps {
  data: IncomeResponse | null
  loading: boolean
}

export const IncomeProjection: React.FC<IncomeProjectionProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-erebor-surface rounded-lg p-6 mb-6 animate-pulse h-40 border border-erebor-border"></div>
    )
  }

  if (!data) {
    return (
      <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6">
        <p className="text-erebor-rune text-center">
          Set your hourly rate in Settings to enable income projection
        </p>
      </div>
    )
  }

  const deductionRate = data.deduction_rate ?? 0.26
  const deductionPct = `${Math.round(deductionRate * 100)}%`

  const rows = [
    {
      label: 'This Paycheck',
      gross: data.current_period_projection,
      tax: data.tax_deductions_paycheck,
      net: data.net_paycheck,
      grossColor: 'text-erebor-parchment',
    },
    {
      label: 'Annual Projected',
      gross: data.annual_gross,
      tax: data.annual_taxes,
      net: data.annual_net,
      grossColor: 'text-erebor-parchment',
    },
    {
      label: 'Best Case',
      gross: data.best_case,
      tax: data.best_case_taxes,
      net: data.best_case_net,
      grossColor: 'text-erebor-gold',
    },
    {
      label: 'Conservative',
      gross: data.conservative_case,
      tax: data.conservative_taxes,
      net: data.conservative_net,
      grossColor: 'text-erebor-mithril',
    },
  ]

  return (
    <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 overflow-x-auto">
      <h3 className="font-cinzel text-xs uppercase tracking-[0.2em] text-erebor-parchment-dim mb-4">Income Projections</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-erebor-border">
            <th className="text-left py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Scenario</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Gross</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Tax (-{deductionPct})</th>
            <th className="text-right py-3 px-4 font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-erebor-border hover:bg-erebor-surface2 transition-colors">
              <td className="py-3 px-4 text-erebor-parchment-dim font-cinzel text-xs uppercase tracking-wide">{row.label}</td>
              <td className={`py-3 px-4 text-right tabular-nums font-medium ${row.grossColor}`}>
                {formatCurrency(row.gross)}
              </td>
              <td className="py-3 px-4 text-right tabular-nums text-erebor-debit">
                -{formatCurrency(row.tax)}
              </td>
              <td className="py-3 px-4 text-right tabular-nums text-erebor-credit font-medium">
                {formatCurrency(row.net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
