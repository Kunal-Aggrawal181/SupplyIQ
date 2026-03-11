// ═══════════════════════════════════════════════════════
// DISPATCH PLAN DATA — Based on real client format
// S.NO | ITEM CODE | DESCRIPTION | PROJECT | SUPPLIER |
// OPENING | SCHEDULE(N) | DISPATCHED | PER DAY PLAN |
// TILL DATE PLAN | GAP | BALANCE | PERCENTAGE
// ═══════════════════════════════════════════════════════

export const DISPATCH_PARTS = [
  {
    sno: 1, itemCode: "61025856", project: "SOP", supplier: "LIL",
    desc: "AC PANEL CPH0572D / AUTO A/C SW - NH900L1-K511",
    opening: 120, scheduleN: 120, dispatched: 0,
    perDayPlan: 5, tillDatePlan: 5, gap: -5, balance: 120, pct: 0,
    status: "red",
    leadTime: 21, unitCost: 142, moq: 500,
  },
  {
    sno: 2, itemCode: "61035830", project: "SOP", supplier: "LIL",
    desc: "CONTL ASSY AUTO A/C - 79600-31X-J411-NH892L",
    opening: 62, scheduleN: 62, dispatched: 90,
    perDayPlan: 3, tillDatePlan: 3, gap: 87, balance: -28, pct: 338.71,
    status: "green",
    leadTime: 14, unitCost: 138, moq: 500,
  },
  {
    sno: 3, itemCode: "61035831", project: "SOP", supplier: "LIL",
    desc: "CONTL ASSY AUTO A/C - 79600-31X K511-M1-TYPEV",
    opening: 1379, scheduleN: 180, dispatched: 0,
    perDayPlan: 8, tillDatePlan: 8, gap: -8, balance: 180, pct: 0,
    status: "red",
    leadTime: 18, unitCost: 145, moq: 200,
  },
  {
    sno: 4, itemCode: "61025857", project: "SOP", supplier: "LIL",
    desc: "CONTL ASSY AUTO A/C - J41/CPH0572E",
    opening: 4423, scheduleN: 120, dispatched: 60,
    perDayPlan: 5, tillDatePlan: 5, gap: 55, balance: 60, pct: 1150,
    status: "yellow",
    leadTime: 14, unitCost: 142, moq: 500,
  },
  {
    sno: 5, itemCode: "61025855", project: "SOP", supplier: "LIL",
    desc: "CONTL ASSY AUTO A/C - K41/CPH0572C",
    opening: 0, scheduleN: 0, dispatched: 0,
    perDayPlan: 0, tillDatePlan: 0, gap: 0, balance: 0, pct: 0,
    status: "green",
    leadTime: 14, unitCost: 142, moq: 500,
  },
  {
    sno: 6, itemCode: "61039987", project: "SOP", supplier: "LIL",
    desc: "CPH0572A/ICS2770 79600-32N K511 M1-NH1071L",
    opening: 0, scheduleN: 1530, dispatched: 1290,
    perDayPlan: 67, tillDatePlan: 67, gap: 1223, balance: 240, pct: 1939.22,
    status: "yellow",
    leadTime: 12, unitCost: 149, moq: 300,
  },
  {
    sno: 7, itemCode: "61038819", project: "SOP", supplier: "Osram",
    desc: "LED 7960031X K412M1",
    opening: 3350, scheduleN: 1230, dispatched: 60,
    perDayPlan: 53, tillDatePlan: 53, gap: 7, balance: 1170, pct: 112.2,
    status: "yellow",
    leadTime: 16, unitCost: 135, moq: 800,
  },
  {
    sno: 8, itemCode: "61038820", project: "SOP", supplier: "LIL",
    desc: "7960031X K512M1-NH9000L1",
    opening: 0, scheduleN: 0, dispatched: 990,
    perDayPlan: 0, tillDatePlan: 0, gap: 990, balance: -990, pct: 0,
    status: "green",
    leadTime: 10, unitCost: 128, moq: 500,
  },
  {
    sno: 9, itemCode: "61038931", project: "SOP", supplier: "LIL",
    desc: "7960031X K512M1-TYPEV",
    opening: 0, scheduleN: 0, dispatched: 180,
    perDayPlan: 0, tillDatePlan: 0, gap: 180, balance: -180, pct: 0,
    status: "green",
    leadTime: 10, unitCost: 130, moq: 200,
  },
  {
    sno: 10, itemCode: "61038932", project: "SOP", supplier: "LIL",
    desc: "7960031X J412M1 (Variant A)",
    opening: 0, scheduleN: 0, dispatched: 0,
    perDayPlan: 0, tillDatePlan: 0, gap: 0, balance: 0, pct: 0,
    status: "green",
    leadTime: 14, unitCost: 132, moq: 500,
  },
  {
    sno: 11, itemCode: "61038933", project: "SOP", supplier: "LIL",
    desc: "7960031X J412M1 (Variant B)",
    opening: 285, scheduleN: 28, dispatched: 0,
    perDayPlan: 1, tillDatePlan: 1, gap: -1, balance: 28, pct: 0,
    status: "red",
    leadTime: 21, unitCost: 140, moq: 100,
  },
];

// ═══════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════

export const CUSTOMERS = [
  {
    id: "CUST-HCI",
    name: "Honda Cars India",
    shortName: "Honda",
    code: "HCI",
    color: "#6366f1",
    totalParts: 11,
    green: 5,
    yellow: 3,
    red: 3,
    totalValue: "₹42.8L",
    onTime: "82%",
    project: "SOP",
    contactPerson: "Rajesh Mehta",
    parts: DISPATCH_PARTS,
  },
  {
    id: "CUST-MSIL",
    name: "Maruti Suzuki India Ltd",
    shortName: "Maruti",
    code: "MSIL",
    color: "#0ea5e9",
    totalParts: 8,
    green: 5,
    yellow: 2,
    red: 1,
    totalValue: "₹31.2L",
    onTime: "93%",
    project: "SOP",
    contactPerson: "Anita Sharma",
    parts: [
      { ...DISPATCH_PARTS[1], itemCode: "62011001", desc: "HVAC CONTROL MODULE - BALENO", status: "green", supplier: "LIL", pct: 98 },
      { ...DISPATCH_PARTS[5], itemCode: "62011002", desc: "AUTO A/C CONTROLLER - SWIFT", status: "green", supplier: "Osram", pct: 104 },
      { ...DISPATCH_PARTS[7], itemCode: "62011003", desc: "LED PANEL UNIT - DZIRE", status: "green", supplier: "LIL", pct: 100 },
      { ...DISPATCH_PARTS[8], itemCode: "62011004", desc: "TEMP SENSOR ASSY - ERTIGA", status: "green", supplier: "LIL", pct: 99 },
      { ...DISPATCH_PARTS[4], itemCode: "62011005", desc: "BLOWER CONTROL - IGNIS", status: "green", supplier: "LIL", pct: 96 },
      { ...DISPATCH_PARTS[3], itemCode: "62011006", desc: "DISPLAY MODULE - CIAZ", status: "yellow", supplier: "Osram", pct: 55, gap: 22 },
      { ...DISPATCH_PARTS[6], itemCode: "62011007", desc: "CONTROL PANEL - VITARA", status: "yellow", supplier: "LIL", pct: 72, gap: 14 },
      { ...DISPATCH_PARTS[0], itemCode: "62011008", desc: "PCB ASSY - FRONX", status: "red", supplier: "LIL", pct: 0, gap: -6 },
    ],
  },
  {
    id: "CUST-TML",
    name: "Tata Motors Ltd",
    shortName: "Tata",
    code: "TML",
    color: "#f59e0b",
    totalParts: 7,
    green: 2,
    yellow: 3,
    red: 2,
    totalValue: "₹24.5L",
    onTime: "71%",
    project: "SOP",
    contactPerson: "Vikram Patel",
    parts: [
      { ...DISPATCH_PARTS[1], itemCode: "63021001", desc: "A/C CONTROL MODULE - NEXON EV", status: "green", supplier: "LIL", pct: 110 },
      { ...DISPATCH_PARTS[8], itemCode: "63021002", desc: "CLIMATE CTRL - HARRIER", status: "green", supplier: "Osram", pct: 102 },
      { ...DISPATCH_PARTS[3], itemCode: "63021003", desc: "THERMAL MGT UNIT - PUNCH EV", status: "yellow", supplier: "LIL", pct: 68, gap: 30 },
      { ...DISPATCH_PARTS[6], itemCode: "63021004", desc: "LED CLUSTER - SAFARI", status: "yellow", supplier: "Osram", pct: 45, gap: 18 },
      { ...DISPATCH_PARTS[5], itemCode: "63021005", desc: "HVAC ECU - TIGOR EV", status: "yellow", supplier: "LIL", pct: 80, gap: 9 },
      { ...DISPATCH_PARTS[0], itemCode: "63021006", desc: "COMPRESSOR CTRL - ALTROZ", status: "red", supplier: "LIL", pct: 5, gap: -12 },
      { ...DISPATCH_PARTS[2], itemCode: "63021007", desc: "AMBIENT LIGHT MODULE - CURVV", status: "red", supplier: "Osram", pct: 0, gap: -8 },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════

export const SUPPLIERS = [
  {
    id: "LIL",
    name: "LIL Electronics",
    score: 8.2,
    leadTime: "14 days",
    unitCost: "₹142/u",
    quality: 82,
    delivery: 80,
    cost: 85,
    risk: "Low",
    riskScore: 80,
    activeOrders: 18,
    partsSupplied: 62,
    onTimePct: 82,
    color: "#6366f1",
    status: "active",
  },
  {
    id: "Osram",
    name: "Osram GmbH",
    score: 9.1,
    leadTime: "12 days",
    unitCost: "₹149/u",
    quality: 95,
    delivery: 91,
    cost: 80,
    risk: "Low",
    riskScore: 92,
    activeOrders: 11,
    partsSupplied: 34,
    onTimePct: 91,
    color: "#10b981",
    status: "active",
  },
  {
    id: "SUP-C",
    name: "Supplier C Pvt Ltd",
    score: 7.4,
    leadTime: "18 days",
    unitCost: "₹138/u",
    quality: 72,
    delivery: 74,
    cost: 88,
    risk: "Medium",
    riskScore: 65,
    activeOrders: 7,
    partsSupplied: 21,
    onTimePct: 74,
    color: "#f59e0b",
    status: "active",
  },
  {
    id: "SUP-X",
    name: "Supplier X Corp",
    score: 5.8,
    leadTime: "22 days",
    unitCost: "₹135/u",
    quality: 48,
    delivery: 62,
    cost: 90,
    risk: "High",
    riskScore: 38,
    activeOrders: 4,
    partsSupplied: 12,
    onTimePct: 58,
    color: "#ef4444",
    status: "watch",
  },
];

// ═══════════════════════════════════════════════════════
// MONTHLY ACTUALS VS PLAN (6 months) — per part
// ═══════════════════════════════════════════════════════

// All months in order (Oct 2025 → Mar 2026 = indices 0–5)
const ALL_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
// Scale factors per month (relative effort / season)
const MONTH_SCALE = [0.90, 0.95, 1.00, 1.05, 1.08, 1.12];
const MONTH_ACT = [0.85, 0.88, 0.92, 0.94, 1.02, 1.00];

/**
 * Returns 6 months of Actual vs Plan history ending at monthIdx.
 * monthIdx 0=Oct … 5=Mar
 */
export function getMonthlyTrend(part, monthIdx = 5) {
  const base = part.perDayPlan * 22 || 10;
  const end = monthIdx;           // inclusive
  const start = Math.max(0, end - 5); // up to 6 bars
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const mi = start + i;
    const isCurrent = mi === end;
    return {
      month: isCurrent ? ALL_MONTHS[mi] + '(MTD)' : ALL_MONTHS[mi],
      plan: isCurrent ? part.tillDatePlan : Math.round(base * MONTH_SCALE[mi]),
      actual: isCurrent ? part.dispatched : Math.round(base * MONTH_ACT[mi]),
    };
  });
}

// ═══════════════════════════════════════════════════════
// 6-MONTH FORECAST (ML mock, month-aware)
// ═══════════════════════════════════════════════════════

/**
 * Returns a 6-month forward forecast starting from the selected month.
 * monthIdx 0=Oct … 5=Mar
 */
export function getForecast(part, monthIdx = 5) {
  const base = part.scheduleN || part.perDayPlan * 22 || 20;
  // Generate month labels beyond the ALL_MONTHS array
  const monthNames = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  // Start index in the extended list
  // ALL_MONTHS 0-5 map to oct-mar; continuing: 6=Apr,7=May,...
  const extStart = monthIdx;
  return Array.from({ length: 6 }, (_, i) => {
    const mi = extStart + i;
    const scale = 1 + i * 0.04;
    const label = monthNames[mi % 12];
    if (i === 0) {
      return { month: label, actual: part.dispatched, forecast: null, plan: part.tillDatePlan };
    }
    return {
      month: label,
      actual: null,
      forecast: Math.round(base * scale),
      plan: Math.round(base * (scale + 0.02)),
    };
  });
}

// ═══════════════════════════════════════════════════════
// SUPPLIER DELIVERY TREND
// ═══════════════════════════════════════════════════════

export const SUPPLIER_DELIVERY_TREND = [
  { month: "Oct", LIL: 88, Osram: 92, "Sup-C": 76, "Sup-X": 65 },
  { month: "Nov", LIL: 85, Osram: 93, "Sup-C": 74, "Sup-X": 60 },
  { month: "Dec", LIL: 82, Osram: 94, "Sup-C": 78, "Sup-X": 58 },
  { month: "Jan", LIL: 84, Osram: 91, "Sup-C": 80, "Sup-X": 62 },
  { month: "Feb", LIL: 80, Osram: 92, "Sup-C": 72, "Sup-X": 55 },
  { month: "Mar", LIL: 82, Osram: 91, "Sup-C": 74, "Sup-X": 48 },
];

// ═══════════════════════════════════════════════════════
// AI ALERTS / DECISION CENTER
// ═══════════════════════════════════════════════════════

export const AI_ALERTS = [
  {
    id: "ALERT-001",
    severity: "critical",
    category: "Supply Disruption",
    title: "Taiwan MLCC Semiconductor Shortage",
    desc: "Global multi-layer ceramic capacitor (MLCC) shortage detected via industry feeds. LIL's IC procurement pipeline is at risk within 30 days. 3 parts for Honda Cars India are directly impacted.",
    affectedCustomer: "Honda Cars India",
    affectedParts: ["61025856", "61035831", "61038933"],
    currentSupplier: "LIL",
    altSupplier: "Osram",
    altSupplierId: "Osram",
    altMatch: 94,
    costImpact: "+₹8,200",
    leadTimeImpact: "-3 days",
    source: "Industry News Feed + ML Risk Model",
    confidence: 87,
    ts: "Mar 06, 09:14 AM",
  },
  {
    id: "ALERT-002",
    severity: "warning",
    category: "Logistics",
    title: "JNPT Port Congestion — 7-Day Delay Risk",
    desc: "Jawaharlal Nehru Port (JNPT) reporting major congestion due to container vessel backlog. Inbound raw material shipments from LIL for Maruti Suzuki order may face 5–7 day delays.",
    affectedCustomer: "Maruti Suzuki India Ltd",
    affectedParts: ["62011006", "62011007"],
    currentSupplier: "LIL",
    altSupplier: "Supplier C Pvt Ltd",
    altSupplierId: "SUP-C",
    altMatch: 78,
    costImpact: "+₹4,100",
    leadTimeImpact: "+2 days",
    source: "Port Authority API + Logistics Partner",
    confidence: 79,
    ts: "Mar 06, 08:45 AM",
  },
  {
    id: "ALERT-003",
    severity: "info",
    category: "Demand Signal",
    title: "Q2 Seasonal Demand Surge Predicted — +18%",
    desc: "ML forecasting model predicts 18% demand increase for April–June based on 3-year seasonal pattern and CRM pipeline data. Pre-buying recommended for critical LED components.",
    affectedCustomer: "All Customers",
    affectedParts: ["61025857", "61039987", "62011006"],
    currentSupplier: "LIL",
    altSupplier: "LIL (Bulk Pre-Buy)",
    altSupplierId: "LIL",
    altMatch: 98,
    costImpact: "-₹12,000 (bulk discount)",
    leadTimeImpact: "0 days",
    source: "ML Demand Model + CRM Pipeline",
    confidence: 92,
    ts: "Mar 05, 11:30 PM",
  },
];

// ═══════════════════════════════════════════════════════
// SUMMARY KPIs (top of customer overview)
// ═══════════════════════════════════════════════════════

export const SUMMARY_KPIS = {
  totalParts: 26,
  greenParts: 12,
  yellowParts: 8,
  redParts: 6,
  totalDispatchValue: "₹98.5L",
  dispatchChange: "+4.2%",
  avgOnTime: "82%",
  activeSuppliers: 4,
  openAlerts: 3,
};

// ═══════════════════════════════════════════════════════
// NEXT STEPS for yellow → green conversion
// ═══════════════════════════════════════════════════════

export const YELLOW_STEPS = [
  "Confirm PO with supplier",
  "Verify lead time commitment",
  "Schedule incoming quality check",
  "Update dispatch plan in SAP",
];
