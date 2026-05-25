import axios, { AxiosInstance } from 'axios'

const BASE_URL = 'http://localhost:8001'

export interface SummaryResponse {
  year: number
  flag_hours_ytd: number
  actual_hours_ytd: number
  ro_count_ytd: number
  efficiency_pct_ytd: number
  days_worked_ytd: number
  avg_ro_per_day: number
  ytd_income: number
  target_flag_hours: number
  progress_pct: number
  month_flag_hours: number
  week_flag_hours: number
}

export interface DailyData {
  date: string
  flag_hours: number
  actual_hours: number
  efficiency_pct: number
  ro_count: number
  cp_hours: number
  wp_hours: number
  ip_hours: number
  week_delta: number
}

export interface MonthlyData {
  month: string
  flag_hours: number
  actual_hours: number
  efficiency_pct: number
  cp_amount: number
  wp_amount: number
  ip_amount: number
}

export interface MonthlyResponse {
  year: number
  months: MonthlyData[]
}

export interface LaborRate {
  id: number
  effective_date: string   // "YYYY-MM-DD"
  rate: number
  notes: string | null
}

export interface PayTypeData {
  pay_type: string
  flag_hours: number
  actual_hours: number
  efficiency_pct: number
  amount: number
}

export interface PayTypesResponse {
  year: number
  pay_types: PayTypeData[]
}

export interface IncomeResponse {
  year: number
  current_period: string
  current_period_flag_hours: number
  current_period_projection: number
  semi_monthly_rate: number
  monthly_projection: number
  best_case: number
  conservative_case: number
  deduction_rate: number
  net_paycheck: number
  tax_deductions_paycheck: number
  annual_gross: number
  annual_net: number
  annual_taxes: number
  best_case_net: number
  best_case_taxes: number
  conservative_net: number
  conservative_taxes: number
}

export interface WeeklySummary {
  week: string
  start_date: string
  end_date: string
  flag_hours: number
  actual_hours: number
  efficiency_pct: number
  ro_count: number
  cp_hours: number
  wp_hours: number
  ip_hours: number
  week_delta: number
}

export interface YearlyWeeksResponse {
  year: number
  weeks: WeeklySummary[]
}

export interface HistoricalYear {
  year: number
  flag_hours_ytd: number
  ro_count_ytd: number
  efficiency_pct_ytd: number
}

export interface HistoricalResponse {
  years: HistoricalYear[]
}

export interface UploadResponse {
  status: string
  inserted: number
  year_range: string
  files_processed: number
}

export interface ManualEntry {
  id: number
  date: string
  ro_number: string
  flag_hours: number
  pay_type: string
}

export interface ManualEntriesResponse {
  week: string
  entries: ManualEntry[]
  total_flag_hours: number
}

export interface AuditComparison {
  date: string
  tekion_hours: number
  manual_hours: number
  delta: number
  discrepancy: boolean
}

export interface AuditResponse {
  year: number
  comparisons: AuditComparison[]
  totals: {
    tekion_total: number
    manual_total: number
    total_delta: number
    discrepancy_days: number
  }
}

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    })
  }

  async getHealth() {
    const res = await this.client.get('/health')
    return res.data
  }

  async getSummary(year: number): Promise<SummaryResponse> {
    const res = await this.client.get('/stats/summary', { params: { year } })
    return res.data
  }

  async getWeekly(week: string): Promise<DailyData[]> {
    const res = await this.client.get('/stats/weekly', { params: { week } })
    return res.data
  }

  async getMonthly(year: number): Promise<MonthlyResponse> {
    const res = await this.client.get('/stats/monthly', { params: { year } })
    return res.data
  }

  async getPayTypes(year: number): Promise<PayTypesResponse> {
    const res = await this.client.get('/stats/pay-types', { params: { year } })
    return res.data
  }

  async getIncome(year: number): Promise<IncomeResponse> {
    const res = await this.client.get('/stats/income', { params: { year } })
    return res.data
  }

  async getYearlyWeeks(year: number): Promise<YearlyWeeksResponse> {
    const res = await this.client.get('/stats/yearly-weeks', { params: { year } })
    return res.data
  }

  async getHistorical(): Promise<HistoricalResponse> {
    const res = await this.client.get('/stats/historical')
    return res.data
  }

  async getCategory(year: number) {
    const res = await this.client.get('/stats/category', { params: { year } })
    return res.data
  }

  async getAudit(year: number): Promise<AuditResponse> {
    const res = await this.client.get('/stats/audit', { params: { year } })
    return res.data
  }

  async uploadFile(file: File, uploadType: 'tech-report' | 'labor-log'): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const endpoint = `/upload/${uploadType}`
    const res = await this.client.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
    return res.data
  }

  async getUploadStatus() {
    const res = await this.client.get('/upload/status')
    return res.data
  }

  async submitManualEntry(date: string, ro_number: string, flag_hours: number) {
    const res = await this.client.post('/manual/entry', { date, ro_number, flag_hours })
    return res.data
  }

  async getManualEntries(week: string): Promise<ManualEntriesResponse> {
    const res = await this.client.get('/manual/entries', { params: { week } })
    return res.data
  }

  async deleteManualEntry(id: number): Promise<{ status: string }> {
    const res = await this.client.delete(`/manual/entry/${id}`)
    return res.data
  }

  async getRates(): Promise<LaborRate[]> {
    const res = await this.client.get('/rates')
    return res.data
  }

  async addRate(effective_date: string, rate: number, notes?: string): Promise<LaborRate> {
    const res = await this.client.post('/rates', { effective_date, rate, notes })
    return res.data
  }

  async deleteRate(id: number): Promise<void> {
    await this.client.delete(`/rates/${id}`)
  }

  async clearAllManualEntries(): Promise<{ status: string; deleted: number }> {
    const res = await this.client.delete('/manual/all')
    return res.data
  }

  downloadManualExport(): void {
    const a = document.createElement('a')
    a.href = `${BASE_URL}/manual/export`
    a.download = 'ManualLaborLog.xlsx'
    a.click()
  }
}

export const apiClient = new APIClient()
