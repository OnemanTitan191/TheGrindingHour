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
      <div className="bg-slate-800 rounded-lg p-6 mb-6 animate-pulse h-40"></div>
    )
  }

  if (!data) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-600">
        <p className="text-slate-400 text-center">
          Set your hourly rate in Settings to enable income projection
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-600">
      <h3 className="text-lg font-bold text-white mb-6">Income Projections</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-700 rounded p-4">
          <p className="text-slate-400 text-xs font-medium mb-2">Current Period</p>
          <p className="font-mono text-xl font-bold text-white">
            {formatCurrency(data.current_period_projection)}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {data.current_period_flag_hours.toFixed(1)} hrs
          </p>
        </div>

        <div className="bg-slate-700 rounded p-4">
          <p className="text-slate-400 text-xs font-medium mb-2">Semi-Monthly Rate</p>
          <p className="font-mono text-xl font-bold text-white">
            {formatCurrency(data.semi_monthly_rate)}
          </p>
        </div>

        <div className="bg-slate-700 rounded p-4">
          <p className="text-slate-400 text-xs font-medium mb-2">Monthly Projection</p>
          <p className="font-mono text-xl font-bold text-white">
            {formatCurrency(data.monthly_projection)}
          </p>
        </div>

        <div className="bg-slate-700 rounded p-4">
          <p className="text-slate-400 text-xs font-medium mb-2">Best Case</p>
          <p className="font-mono text-xl font-bold text-yellow-400">
            {formatCurrency(data.best_case)}
          </p>
        </div>

        <div className="bg-slate-700 rounded p-4">
          <p className="text-slate-400 text-xs font-medium mb-2">Conservative</p>
          <p className="font-mono text-xl font-bold text-blue-400">
            {formatCurrency(data.conservative_case)}
          </p>
        </div>
      </div>
    </div>
  )
}
