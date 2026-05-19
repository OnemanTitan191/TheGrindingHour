export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatHours = (value: number): string => {
  return value.toFixed(1) + ' hrs'
}

export const formatEfficiency = (value: number): string => {
  return value.toFixed(1) + '%'
}

export const getEfficiencyColor = (efficiency: number): string => {
  if (efficiency >= 90) return '#5A7C5C' // shire
  if (efficiency >= 80) return '#D4AF37' // rohirrim
  return '#DC3545' // flame
}

export const getEfficiencyColorName = (efficiency: number): 'shire' | 'rohirrim' | 'flame' => {
  if (efficiency >= 90) return 'shire'
  if (efficiency >= 80) return 'rohirrim'
  return 'flame'
}

export const getCurrentWeek = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const weekOne = new Date(jan4)
  weekOne.setDate(jan4.getDate() - jan4.getDay() + 1)

  const diff = Math.floor((now.getTime() - weekOne.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  const week = String(diff).padStart(2, '0')

  return `${year}-W${week}`
}

export const getDayOfWeekName = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
