/**
 * Customer-Directed Data Model for Supply Intelligence
 * Focus: High-density N-3 Performance Analysis
 */

const MONTH_NAMES = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

/**
 * Returns Forecast vs Actual data for a 4-month window (N-3 to N).
 * N is the current month index (monthIdx).
 */
export const getPartBarGraphData = (part, monthIdx = 5) => {
  if (!part) return [];
  
  // Forecast factors (from client)
  const forecastFactors = [0.92, 0.98, 1.05, 1.10, 1.08, 1.12];
  // Actual performance factors
  const actualFactors = [0.88, 0.95, 1.02, 1.08, 1.00, 0.00]; // last one is special case

  const base = part.scheduleN || (part.perDayPlan * 22) || 1500;

  return Array.from({ length: 4 }, (_, i) => {
    const mi = monthIdx - 3 + i;
    const isCurrent = (mi === monthIdx);
    
    // Client-provided demand forecast
    const forecastVal = Math.round(base * (forecastFactors[mi] || 1.0));
    
    // Historical/Actual demand
    let actualVal;
    if (isCurrent) {
      actualVal = part.scheduleN || 0;
    } else {
      actualVal = Math.round(base * (actualFactors[mi] || 0.9));
    }

    return {
      month: MONTH_NAMES[mi % 12],
      forecast: forecastVal,
      actual: actualVal,
      isCurrent
    };
  });
};

/**
 * Reverted 6-month historical trend (Area Chart data)
 */
export const getMonthlyTrend = (part, monthIdx = 5) => {
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const base = part.perDayPlan * 22 || 10;
  
  return Array.from({ length: 6 }, (_, i) => {
    const mi = Math.max(0, monthIdx - 5 + i);
    const isCurrent = mi === monthIdx;
    
    return {
      month: isCurrent ? monthNames[mi] + '(MTD)' : monthNames[mi],
      plan: isCurrent ? part.tillDatePlan : Math.round(base * (1 + i * 0.03)),
      actual: isCurrent ? part.dispatched : Math.round(base * (1 + i * 0.025)),
    };
  });
};

/**
 * Reverted 6-month forecast (Area Chart data)
 */
export function getForecast(part, monthIdx = 5) {
  const base = part.scheduleN || part.perDayPlan * 22 || 20;
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  
  return Array.from({ length: 6 }, (_, i) => {
    const mi = monthIdx + i;
    const scale = 1 + i * 0.04;
    const label = monthNames[mi % 12];
    
    if (i === 0) return { month: label, actual: part.dispatched, forecast: null, plan: part.tillDatePlan };
    
    return {
      month: label,
      actual: null,
      forecast: Math.round(base * scale),
      plan: Math.round(base * (scale + 0.02)),
    };
  });
}
