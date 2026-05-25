import React from 'react'
import { SummaryResponse } from '../../api/client'
import { formatCurrency, formatHours, formatEfficiency, getEfficiencyColor } from '../../utils/format'

interface YTDCardsProps {
  data: SummaryResponse | null
  loading: boolean
}

function getTopColor(efficiency?: number): string {
  if (efficiency === undefined) return 'border-t-erebor-gold'
  if (efficiency >= 125) return 'border-t-erebor-credit'
  if (efficiency >= 100) return 'border-t-erebor-gold'
  if (efficiency >= 90)  return 'border-t-[#c44a10]'
  return 'border-t-erebor-debit'
}

function getEfficiencySubtitle(efficiency: number): string {
  if (efficiency >= 125) return 'Excellent'
  if (efficiency >= 100) return 'Good'
  if (efficiency >= 90)  return 'On Track'
  return 'Below Target'
}

// Gradient: red → orange → gold → green, threshold stops at 50% / 75% / 90%
const PROGRESS_GRADIENT = 'linear-gradient(to right, #a02828 0%, #c44a10 50%, #c9a84c 75%, #1e6e3c 90%)'

function ProgressBar({ label, current, target, pct }: {
  label: string
  current: number
  target: number
  pct: number
}) {
  const safeCurrent = current ?? 0
  const safeTarget = (target && target > 0) ? target : 1
  const safePct = isFinite(pct) && !isNaN(pct) ? pct : 0
  const barPct = Math.min(Math.max(safePct, 0), 100)
  return (
    <div>
      <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim mb-2">{label}</p>
      <div className="w-full bg-erebor-surface2 rounded-full h-6 overflow-hidden">
        <div
          className="h-full flex items-center justify-end pr-2 transition-all duration-500"
          style={{ width: `${barPct}%`, background: PROGRESS_GRADIENT }}
        >
          {barPct > 10 && (
            <span className="text-erebor-bg font-mono text-xs font-bold">{safePct.toFixed(1)}%</span>
          )}
        </div>
      </div>
      <p className="text-[10px] text-erebor-rune mt-1">
        {safeCurrent.toFixed(1)} of {safeTarget.toFixed(1)} target hours
      </p>
    </div>
  )
}

export const YTDCards: React.FC<YTDCardsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-erebor-surface border border-erebor-border border-t-2 border-t-erebor-gold rounded px-5 py-4 animate-pulse h-24"></div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const efficiencyTopColor = getTopColor(data.efficiency_pct_ytd)
  const efficiencyValueColor = getEfficiencyColor(data.efficiency_pct_ytd)

  const cards = [
    {
      label: 'Flag Hours YTD',
      value: formatHours(data.flag_hours_ytd),
      subtitle: 'Tekion-verified',
      topColor: 'border-t-erebor-gold',
      valueColor: undefined as string | undefined,
    },
    {
      label: 'RO Count YTD',
      value: `${data.ro_count_ytd}`,
      subtitle: 'repair orders',
      topColor: 'border-t-erebor-gold',
      valueColor: undefined as string | undefined,
    },
    {
      label: 'Efficiency %',
      value: formatEfficiency(data.efficiency_pct_ytd),
      subtitle: getEfficiencySubtitle(data.efficiency_pct_ytd),
      topColor: efficiencyTopColor,
      valueColor: efficiencyValueColor,
    },
    {
      label: 'Actual Hours YTD',
      value: formatHours(data.actual_hours_ytd),
      subtitle: undefined,
      topColor: 'border-t-erebor-mithril',
      valueColor: undefined as string | undefined,
    },
    {
      label: 'Avg RO / Day',
      value: `${data.avg_ro_per_day ?? data.days_worked_ytd}`,
      subtitle: 'repair orders per day',
      topColor: 'border-t-erebor-mithril',
      valueColor: undefined as string | undefined,
    },
    {
      label: 'Income YTD',
      value: formatCurrency(data.ytd_income ?? 0),
      subtitle: 'flag hrs × rate',
      topColor: 'border-t-erebor-gold',
      valueColor: undefined as string | undefined,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-erebor-surface border border-erebor-border border-t-2 ${card.topColor} rounded px-5 py-4 gold-hover`}
          >
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim mb-2">
              {card.label}
            </p>
            <p
              className="text-2xl tabular-nums font-light"
              style={{ color: card.valueColor ?? '#e4dcc8' }}
            >{card.value}</p>
            {card.subtitle && (
              <p className="text-[10px] text-erebor-rune mt-1">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Goal Progress Bars */}
      <div className="bg-erebor-surface border border-erebor-border border-t-2 border-t-erebor-gold rounded px-5 py-4 mb-6 space-y-4">
        <ProgressBar
          label="Annual Goal Progress"
          current={data.flag_hours_ytd}
          target={data.target_flag_hours}
          pct={data.progress_pct}
        />
        <ProgressBar
          label={`${new Date().toLocaleString('en-US', { month: 'long' })} Progress`}
          current={data.month_flag_hours}
          target={data.target_flag_hours / 12}
          pct={(data.month_flag_hours / (data.target_flag_hours / 12)) * 100}
        />
        <ProgressBar
          label="This Week"
          current={data.week_flag_hours}
          target={data.target_flag_hours / 52}
          pct={(data.week_flag_hours / (data.target_flag_hours / 52)) * 100}
        />
      </div>
    </>
  )
}
