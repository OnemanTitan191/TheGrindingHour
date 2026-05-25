import React, { useState, useEffect, useCallback } from 'react'
import { apiClient, SummaryResponse, MonthlyResponse, PayTypesResponse, YearlyWeeksResponse } from '../../api/client'
import { YTDCards } from './YTDCards'
import { LaborTrackingTile } from './LaborTrackingTile'
import { WeeklyTable } from './WeeklyTable'
import { MonthlyChart } from './MonthlyChart'
import { PayTypeBreakdown } from './PayTypeBreakdown'

interface DashboardTabProps {
  selectedYear: number
  refreshKey: number
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ selectedYear, refreshKey }) => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | null>(null)
  const [payTypesData, setPayTypesData] = useState<PayTypesResponse | null>(null)
  const [yearlyWeeksData, setYearlyWeeksData] = useState<YearlyWeeksResponse | null>(null)

  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingMonthly, setLoadingMonthly] = useState(true)
  const [loadingPayTypes, setLoadingPayTypes] = useState(true)
  const [loadingYearlyWeeks, setLoadingYearlyWeeks] = useState(true)

  const [error, setError] = useState<string | null>(null)

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
      setLoadingYearlyWeeks(true)
      const yearlyWeeksRes = await apiClient.getYearlyWeeks(year)
      setYearlyWeeksData(yearlyWeeksRes)
    } catch (err) {
      console.error('Failed to fetch yearly weeks:', err)
    } finally {
      setLoadingYearlyWeeks(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedYear)
  }, [selectedYear, refreshKey, fetchData])

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-erebor-debit-dim border border-erebor-debit rounded-lg p-4 text-erebor-parchment-dim">
          {error}
        </div>
      )}

      <LaborTrackingTile />
      <YTDCards data={summary} loading={loadingSummary} />
      <WeeklyTable data={yearlyWeeksData?.weeks ?? null} loading={loadingYearlyWeeks} />
      <MonthlyChart data={monthlyData} loading={loadingMonthly} />
      <PayTypeBreakdown data={payTypesData} loading={loadingPayTypes} />
    </div>
  )
}
