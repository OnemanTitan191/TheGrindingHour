import axios, { AxiosInstance } from 'axios'

const BASE_URL = 'http://localhost:8001'

export interface SummaryResponse {
  year: number
  flag_hours_ytd: number
  actual_hours_ytd: number
  ro_count_ytd: number
  efficiency_pct_ytd: number
  days_worked_ytd: number
  income_projection_ytd: number
  target_flag_hours: number
  progress_pct: number
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

  async uploadFile(file: File, uploadType: 'tech-report' | 'ro-list' | 'labor-log'): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const endpoint = `/upload/${uploadType}`
    const res = await this.client.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  }

  async getUploadStatus() {
    const res = await this.client.get('/upload/status')
    return res.data
  }
}

export const apiClient = new APIClient()
