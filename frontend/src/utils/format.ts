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
  if (efficiency >= 125) return '#1e6e3c'  // green
  if (efficiency >= 100) return '#c9a84c'  // gold
  if (efficiency >= 90)  return '#c44a10'  // orange
  return '#a02828'                          // red
}

export const getCurrentWeek = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const day = jan4.getDay()
  const isoDay = day === 0 ? 7 : day  // Sunday (0) → 7 so ISO Monday=1 works correctly
  const weekOne = new Date(year, 0, jan4.getDate() - (isoDay - 1))
  // Use Date.UTC to avoid DST hour discrepancy between winter weekOne and summer now
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const utcWeekOne = Date.UTC(weekOne.getFullYear(), weekOne.getMonth(), weekOne.getDate())
  const diff = Math.floor((utcNow - utcWeekOne) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${year}-W${String(diff).padStart(2, '0')}`
}

function weekToMonday(weekStr: string): Date {
  const [yearStr, wStr] = weekStr.split('-W')
  const year = parseInt(yearStr, 10), week = parseInt(wStr, 10)
  const jan4 = new Date(year, 0, 4)
  const isoDay = jan4.getDay() === 0 ? 7 : jan4.getDay()
  return new Date(year, 0, jan4.getDate() - (isoDay - 1) + (week - 1) * 7)
}

function dateToISOWeek(date: Date): string {
  const thu = new Date(date)
  thu.setDate(date.getDate() + (4 - (date.getDay() || 7)))
  const year = thu.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const isoDay = jan4.getDay() === 0 ? 7 : jan4.getDay()
  const weekOne = new Date(year, 0, jan4.getDate() - (isoDay - 1))
  // Use Date.UTC to avoid DST hour discrepancy (winter weekOne vs summer date)
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const utcWeekOne = Date.UTC(weekOne.getFullYear(), weekOne.getMonth(), weekOne.getDate())
  const diff = Math.floor((utcDate - utcWeekOne) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${year}-W${String(diff).padStart(2, '0')}`
}

export const offsetWeek = (weekStr: string, delta: number): string => {
  const monday = weekToMonday(weekStr)
  monday.setDate(monday.getDate() + delta * 7)
  return dateToISOWeek(monday)
}

export const weekLabel = (weekStr: string): string => {
  const monday = weekToMonday(weekStr)
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

export const getDayOfWeekName = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export const formatDateShort = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)  // local midnight — avoids UTC→local timezone shift
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
