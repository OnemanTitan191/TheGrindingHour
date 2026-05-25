import React, { useMemo } from 'react'
import { DailyData } from '../../api/client'
import { formatHours, formatEfficiency, getEfficiencyColor } from '../../utils/format'

interface WeekKPICardProps {
  weekData: DailyData[] | null
  loading: boolean
}

export const WeekKPICard: React.FC<WeekKPICardProps> = ({ weekData, loading }) => {
  const stats = useMemo(() => {
    if (!weekData || weekData.length === 0) {
      return {
        flagHours: 0,
        efficiency: 0,
        delta: 0,
        previousWeekDelta: 0,
      }
    }

    const flagHours = weekData.reduce((sum, d) => sum + d.flag_hours, 0)
    const actualHours = weekData.reduce((sum, d) => sum + d.actual_hours, 0)
    const efficiency = actualHours > 0 ? (flagHours / actualHours) * 100 : 0
    const delta = weekData[weekData.length - 1]?.flag_hours || 0
    const previousWeekDelta = weekData[0]?.week_delta || 0

    return {
      flagHours: Math.round(flagHours * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      delta,
      previousWeekDelta,
    }
  }, [weekData])

  if (loading) {
    return <div className="bg-erebor-surface2 rounded-lg p-8 animate-pulse h-40 border border-erebor-border"></div>
  }

  if (!weekData) return null

  const efficiencyColor = getEfficiencyColor(stats.efficiency)
  const isDeltaUp = stats.previousWeekDelta >= 0

  return (
    <div className="rounded-lg p-8 border-2 border-erebor-border bg-erebor-surface carved-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim mb-2">Current Week</p>
          <p className="text-4xl text-erebor-parchment tabular-nums font-light">{formatHours(stats.flagHours)}</p>
          <p className="text-erebor-rune text-xs mt-2">Flag hrs ÷ Actual hrs</p>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim mb-2">Efficiency</p>
            <p className="text-4xl tabular-nums font-light" style={{ color: efficiencyColor }}>
              {formatEfficiency(stats.efficiency)}
            </p>
          </div>
        </div>

        <div className="flex items-end">
          <div>
            <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim mb-2">Week Delta</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-erebor-parchment tabular-nums font-light">
                {isDeltaUp ? '↑' : '↓'} {Math.abs(stats.previousWeekDelta).toFixed(1)}
              </span>
              <p className="text-erebor-rune text-xs">flag hrs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
