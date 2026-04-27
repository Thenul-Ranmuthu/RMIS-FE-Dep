// =============================================================
// services/chartTransformers.ts
// Pure functions: API data → Recharts-ready shapes.
// SRP: Only data-shaping. No UI, no fetching.
// Lives in services/ because it is reusable business-logic,
// not a UI component and not a type definition.
// =============================================================

import type {
  AnalyticsDashboardData,
  BarChartDataPoint,
  CompanyQuotaBreakdown,
  PieChartDataPoint,
} from "@/types/analytics";

// Colour palette — cycles for unlimited companies
const SLICE_COLORS = [
  "#C8A96E", "#4A7C8E", "#7E5A9B", "#3D8B6E", "#C96E6E",
  "#6E7EC8", "#8EC86E", "#C8836E", "#6EC8B8", "#A96EC8",
];

// ── Transformers ──────────────────────────────────────────────

/**
 * Per-company → Recharts BarChart data.
 * Values are in thousands (÷1000) to keep axis labels readable.
 */
export function toBarChartData(breakdowns: CompanyQuotaBreakdown[]): BarChartDataPoint[] {
  return breakdowns.map((c) => ({
    company: truncateLabel(c.companyName, 14),
    approved: roundTwo(c.approvedQuota / 1000),
    used: roundTwo(c.usedQuota / 1000),
    remaining: roundTwo(c.remainingQuota / 1000),
  }));
}

/**
 * System summary → two-slice pie (Used / Remaining).
 */
export function toSystemPieData(dashboard: AnalyticsDashboardData): PieChartDataPoint[] {
  const { totalUsedQuota, totalRemainingQuota } = dashboard.systemSummary;
  const total = totalUsedQuota + totalRemainingQuota;
  return [
    { name: "Used Quota", value: roundTwo(totalUsedQuota), percentage: pct(totalUsedQuota, total), fill: "#C96E6E" },
    { name: "Remaining Quota", value: roundTwo(totalRemainingQuota), percentage: pct(totalRemainingQuota, total), fill: "#3D8B6E" },
  ];
}

/**
 * Per-company → pie showing each company's share of the approved pool.
 */
export function toCompanyPieData(breakdowns: CompanyQuotaBreakdown[]): PieChartDataPoint[] {
  const total = breakdowns.reduce((s, c) => s + c.approvedQuota, 0);
  return breakdowns.map((c, i) => ({
    name: c.companyName,
    value: roundTwo(c.approvedQuota),
    percentage: pct(c.approvedQuota, total),
    fill: SLICE_COLORS[i % SLICE_COLORS.length],
  }));
}

// ── Formatters (used in components directly) ──────────────────

export function formatQuotaValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ton`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ton`;
  return `${value.toFixed(0)} ton`;
}

export function formatGeneratedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ── Helpers ───────────────────────────────────────────────────

function roundTwo(n: number): number {
  return Math.round(n * 100) / 100;
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return roundTwo((part / total) * 100);
}

function truncateLabel(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}