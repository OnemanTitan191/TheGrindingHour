import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MonthlyResponse } from '../../api/client'
import { getEfficiencyColor } from '../../utils/format'

interface MonthlyChartProps {
  data: MonthlyResponse | null
  loading: boolean
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6 h-96 animate-pulse"></div>
    )
  }

  if (!data || data.months.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-center">No data available</p>
      </div>
    )
  }

  const chartData = data.months.map((month) => ({
    name: month.month.substring(0, 3),
    flagHours: month.flag_hours,
    efficiency: month.efficiency_pct,
    fill: getEfficiencyColor(month.efficiency_pct),
  }))

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Monthly Overview</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#94a3b8" label={{ value: 'Flag Hours', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return [value.toFixed(1), 'Flag Hrs']
              }
              return value
            }}
          />
          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
          <Bar dataKey="flagHours" fill="#5A7C5C" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
