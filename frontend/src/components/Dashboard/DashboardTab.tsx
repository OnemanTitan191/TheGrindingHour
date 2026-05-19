import React, { useState, useEffect, useCallback } from 'react'
import { apiClient, SummaryResponse, DailyData, MonthlyResponse, PayTypesResponse, IncomeResponse } from '../../api/client'
import { getCurrentWeek } from '../../utils/format'
import { YTDCards } from './YTDCards'
import { WeekKPICard } from './WeekKPICard'
import { WeeklyTable } from './WeeklyTable'
import { MonthlyChart } from './MonthlyChart'
import { PayTypeBreakdown } from './PayTypeBreakdown'
import { IncomeProjection } from './IncomeProjection'
import { YearSelector } from './YearSelector'

export const DashboardTab: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [weeklyData, setWeeklyData] = useState<DailyData[] | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | null>(null)
  const [payTypesData, setPayTypesData] = useState<PayTypesResponse | null>(null)
  const [incomeData, setIncomeData] = useState<IncomeResponse | null>(null)

  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingWeekly, setLoadingWeekly] = useState(true)
  const [loadingMonthly, setLoadingMonthly] = useState(true)
  const [loadingPayTypes, setLoadingPayTypes] = useState(true)
  const [loadingIncome, setLoadingIncome] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const currentWeek = getCurrentWeek()

  const fetchData = useCallback(async (year: number) => {
    setError(null)
    try {
      setLoadingSummary(true)
      const summaryRes = await apiClient.getSummary(year)
      setSummary(summaryRes)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
      setError('Failed to load summary data')
    } finally {
      setLoadingSummary(false)
    }

    try {
      setLoadingWeekly(true)
      const weeklyRes = await apiClient.getWeekly(currentWeek)
      setWeeklyData(weeklyRes)
    } catch (err) {
      console.error('Failed to fetch weekly:', err)
      setError('Failed to load weekly data')
    } finally {
      setLoadingWeekly(false)
    }

    try {
      setLoadingMonthly(true)
      const monthlyRes = await apiClient.getMonthly(year)
      setMonthlyData(monthlyRes)
    } catch (err) {
      console.error('Failed to fetch monthly:', err)
      setError('Failed to load monthly data')
    } finally {
      setLoadingMonthly(false)
    }

    try {
      setLoadingPayTypes(true)
      const payTypesRes = await apiClient.getPayTypes(year)
      setPayTypesData(payTypesRes)
    } catch (err) {
      console.error('Failed to fetch pay types:', err)
      setError('Failed to load pay type data')
    } finally {
      setLoadingPayTypes(false)
    }

    try {
      setLoadingIncome(true)
      const incomeRes = await apiClient.getIncome(year)
      setIncomeData(incomeRes)
    } catch (err) {
      console.error('Failed to fetch income:', err)
      setError('Failed to load income data')
    } finally {
      setLoadingIncome(false)
    }
  }, [currentWeek])

  useEffect(() => {
    fetchData(selectedYear)
  }, [selectedYear, fetchData])

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
  }

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <YearSelector selectedYear={selectedYear} onYearChange={handleYearChange} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* YTD Summary Cards */}
      <YTDCards data={summary} loading={loadingSummary} />

      {/* Current Week KPI Card */}
      <WeekKPICard weekData={weeklyData} loading={loadingWeekly} />

      {/* Weekly 7-Day Table */}
      <WeeklyTable data={weeklyData} loading={loadingWeekly} />

      {/* Monthly Bar Chart */}
      <MonthlyChart data={monthlyData} loading={loadingMonthly} />

      {/* Pay Type Breakdown */}
      <PayTypeBreakdown data={payTypesData} loading={loadingPayTypes} />

      {/* Income Projections */}
      <IncomeProjection data={incomeData} loading={loadingIncome} />
    </div>
  )
}
