// =============================================================
// types/analytics.ts
// TypeScript interfaces mirroring Java backend DTOs exactly.
// Placed in types/ — shared across app/, components/, services/
// =============================================================

/**
 * Mirrors: SystemQuotaSummaryDTO.java
 * System-wide aggregated quota figures from AnnualQuotaDistribution + QuotaRequest
 */
export interface SystemQuotaSummary {
  totalApprovedQuota: number;    // from AnnualQuotaDistribution.sumAnnualQuota()
  totalUsedQuota: number;        // from QuotaRequest SUM(approvedAmount) WHERE status=APPROVED
  totalRemainingQuota: number;   // totalApprovedQuota - totalUsedQuota
  totalCompanies: number;
  totalApprovedRequests: number;
}

/**
 * Mirrors: CompanyQuotaBreakdownDTO.java
 * Per-company quota data — drives bar & pie chart series
 */
export interface CompanyQuotaBreakdown {
  companyId: number;
  companyName: string;
  registrationNumber: string;
  approvedQuota: number;     // company's share of annual budget (annualQuota / activeCompanies)
  usedQuota: number;         // SUM of approvedAmount on APPROVED QuotaRequests for this company
  remainingQuota: number;    // approvedQuota - usedQuota
  usagePercentage: number;   // for chart sizing
}

/**
 * Mirrors: AnalyticsDashboardDTO.java
 * Top-level API response from GET /api/v1/analytics/dashboard
 */
export interface AnalyticsDashboardData {
  systemSummary: SystemQuotaSummary;
  companyBreakdowns: CompanyQuotaBreakdown[];
  generatedAt: string; // ISO-8601
}

// ── Chart data shapes ─────────────────────────────────────────

export interface BarChartDataPoint {
  company: string;
  approved: number;
  used: number;
  remaining: number;
}

export interface PieChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

// ── API / loading state ───────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// ── Auth / User ───────────────────────────────────────────────

export type UserRole = "MINISTRY_ADMIN" | "COMPANY_USER" | "GUEST";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}