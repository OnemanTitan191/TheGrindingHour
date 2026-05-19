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
    return <div className="bg-slate-700 rounded-lg p-8 animate-pulse h-40"></div>
  }

  if (!weekData) return null

  const efficiencyColor = getEfficiencyColor(stats.efficiency)
  const isDeltaUp = stats.previousWeekDelta >= 0

  return (
    <div className="rounded-lg p-8 border-2 border-slate-600 bg-gradient-to-br from-slate-800 to-slate-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">Current Week</p>
          <p className="font-mono text-4xl font-bold text-white">{formatHours(stats.flagHours)}</p>
          <p className="text-slate-500 text-xs mt-2">Flag hrs ÷ Actual hrs</p>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Efficiency</p>
            <p className="font-mono text-4xl font-bold" style={{ color: efficiencyColor }}>
              {formatEfficiency(stats.efficiency)}
            </p>
          </div>
        </div>

        <div className="flex items-end">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">Week Delta</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white">
                {isDeltaUp ? '↑' : '↓'} {Math.abs(stats.previousWeekDelta).toFixed(1)}
              </span>
              <p className="text-slate-500 text-xs">flag hrs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
