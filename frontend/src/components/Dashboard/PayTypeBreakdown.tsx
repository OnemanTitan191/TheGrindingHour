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
  'Customer Pay': '#c9a84c',
  'Warranty': '#a02828',
  'Internal': '#8ab0d8',
}

const PAY_TYPE_BORDER: Record<string, string> = {
  'Customer Pay': 'border-erebor-gold',
  'Warranty': 'border-erebor-debit',
  'Internal': 'border-erebor-mithril',
}

export const PayTypeBreakdown: React.FC<PayTypeBreakdownProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 h-64 animate-pulse border border-erebor-border"></div>
    )
  }

  if (!data || data.pay_types.length === 0) {
    return (
      <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 border border-erebor-border">
        <p className="text-erebor-rune text-center">No data available</p>
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
    <div className="bg-erebor-surface carved-border rounded-lg p-6 mb-6 border border-erebor-border">
      <h3 className="font-cinzel text-xs uppercase tracking-[0.2em] text-erebor-parchment-dim mb-4">Pay Type Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: pie chart */}
        <div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, x, y, textAnchor, dominantBaseline }: any) => (
                  <text x={x} y={y} textAnchor={textAnchor} dominantBaseline={dominantBaseline}
                    fill="#a89878" fontSize={10} fontFamily="Inter, sans-serif">
                    {`${name}: ${value.toFixed(1)} hrs`}
                  </text>
                )}
                outerRadius={90}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PAY_TYPE_COLORS[entry.name as keyof typeof PAY_TYPE_COLORS] || '#5a6a7a'}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload[0]) {
                    const entry = payload[0].payload
                    return (
                      <div className="bg-erebor-surface border border-erebor-border rounded p-3">
                        <p className="text-erebor-parchment font-cinzel text-xs uppercase tracking-wide">{entry.name}</p>
                        <p className="text-erebor-parchment-dim text-sm font-mono mt-1">{entry.value.toFixed(1)} hrs</p>
                        <p className="text-erebor-parchment-dim text-sm font-mono">{formatCurrency(entry.amount)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: stacked sub-tiles */}
        <div className="flex flex-col gap-3 justify-center">
          {data.pay_types.map((pt) => {
            const borderClass = PAY_TYPE_BORDER[pt.pay_type] ?? 'border-erebor-border'
            return (
              <div
                key={pt.pay_type}
                className={`p-3 bg-erebor-surface2 rounded border border-erebor-border border-l-4 ${borderClass}`}
              >
                <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-erebor-parchment-dim">{pt.pay_type}</p>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-erebor-parchment font-mono font-bold">{pt.flag_hours.toFixed(1)} hrs</p>
                  <p className="text-erebor-parchment-dim text-sm font-mono">{formatCurrency(pt.amount)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
