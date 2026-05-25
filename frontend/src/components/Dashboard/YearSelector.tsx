import React, { useState, useEffect } from 'react'
import { apiClient } from '../../api/client'

interface YearSelectorProps {
  selectedYear: number
  onYearChange: (year: number) => void
}

export const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, onYearChange }) => {
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await apiClient.getHistorical()
        const years = response.years.map((y) => y.year).sort((a, b) => b - a)
        setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()])
      } catch (error) {
        const currentYear = new Date().getFullYear()
        setAvailableYears([
          currentYear,
          currentYear - 1,
          currentYear - 2,
          currentYear - 3,
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchYears()
  }, [])

  if (loading) {
    return <div className="inline-block animate-pulse text-erebor-rune text-xs font-cinzel">Loading years...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="year-select" className="font-cinzel text-xs uppercase tracking-[0.15em] text-erebor-parchment-dim">
        Year:
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
        className="appearance-none px-4 py-2 bg-erebor-surface2 text-erebor-parchment rounded border border-erebor-border hover:border-erebor-gold-dim focus:border-erebor-gold focus:outline-none font-mono transition-colors"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}
