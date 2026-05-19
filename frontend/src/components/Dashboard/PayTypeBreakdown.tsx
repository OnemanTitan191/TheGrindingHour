import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PayTypesResponse } from '../../api/client'
import { formatCurrency } from '../../utils/format'

interface PayTypeBreakdownProps {
  data: PayTypesResponse | null
  loading: boolean
}

const PAY_TYPE_COLORS = {
  'Customer Pay': '#5A7C5C',
  'Warranty': '#D4AF37',
  'Internal': '#DC3545',
}

export const PayTypeBreakdown: React.FC<PayTypeBreakdownProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6 h-96 animate-pulse"></div>
    )
  }

  if (!data || data.pay_types.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <p className="text-slate-400 text-center">No data available</p>
      </div>
    )
  }

  const chartData = data.pay_types.map((pt) => ({
    name: pt.pay_type,
    value: Math.round(pt.flag_hours * 10) / 10,
    amount: pt.amount,
    efficiency: pt.efficiency_pct,
  }))

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-white mb-4">Pay Type Breakdown</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)} hrs`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  PAY_TYPE_COLORS[entry.name as keyof typeof PAY_TYPE_COLORS] || '#8884d8'
                }
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
            content={({ active, payload }: any) => {
              if (active && payload && payload[0]) {
                const entry = payload[0].payload
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded p-3">
                    <p className="text-white font-semibold">{entry.name}</p>
                    <p className="text-slate-300 text-sm">
                      {entry.value.toFixed(1)} hrs
                    </p>
                    <p className="text-slate-300 text-sm">
                      {formatCurrency(entry.amount)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.pay_types.map((pt) => (
          <div key={pt.pay_type} className="p-3 bg-slate-700 rounded">
            <p className="text-slate-400 text-xs font-medium">{pt.pay_type}</p>
            <p className="text-white font-mono font-bold">{pt.flag_hours.toFixed(1)} hrs</p>
            <p className="text-slate-300 text-sm font-mono">{formatCurrency(pt.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
