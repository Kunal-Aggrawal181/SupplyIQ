// Moved from mockData.js — pure computation, no network calls needed.

const ALL_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
const MONTH_SCALE = [0.90, 0.95, 1.00, 1.05, 1.08, 1.12]
const MONTH_ACT   = [0.85, 0.88, 0.92, 0.94, 1.02, 1.00]

export function getMonthlyTrend(part, monthIdx = 5) {
  const base = part.perDayPlan * 22 || 10
  const end = monthIdx
  const start = Math.max(0, end - 5)
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const mi = start + i
    const isCurrent = mi === end
    return {
      month: isCurrent ? ALL_MONTHS[mi] + '(MTD)' : ALL_MONTHS[mi],
      plan:   isCurrent ? part.tillDatePlan : Math.round(base * MONTH_SCALE[mi]),
      actual: isCurrent ? part.dispatched   : Math.round(base * MONTH_ACT[mi]),
    }
  })
}

export function getForecast(part, monthIdx = 5) {
  const base = part.scheduleN || part.perDayPlan * 22 || 20
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]
  return Array.from({ length: 6 }, (_, i) => {
    const mi = monthIdx + i
    const scale = 1 + i * 0.04
    const label = monthNames[mi % 12]
    if (i === 0) return { month: label, actual: part.dispatched, forecast: null, plan: part.tillDatePlan }
    return {
      month: label,
      actual: null,
      forecast: Math.round(base * scale),
      plan: Math.round(base * (scale + 0.02)),
    }
  })
}

export const YELLOW_STEPS = [
  "Confirm PO with supplier",
  "Verify lead time commitment",
  "Schedule incoming quality check",
  "Update dispatch plan in SAP",
]
