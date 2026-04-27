// =============================================================
// services/analyticsService.ts
// All HTTP calls for the analytics domain live here.
// In Next.js this is called from:
//   - Server Components  → directly (no CORS, uses server env vars)
//   - Client Components  → via the hook in components/
// =============================================================

import type { AnalyticsDashboardData } from "@/types/analytics";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://www.rmis.space/api";

// ── Custom typed errors ───────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AccessDeniedError extends ApiError {
  constructor(
    message = "Ministry Administrator access is required to view analytics.",
  ) {
    super(message, 403);
    this.name = "AccessDeniedError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

// ── Base fetch wrapper ────────────────────────────────────────

async function apiFetch<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  // Token passed explicitly (client) or picked from cookie/header (server)
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: "GET", headers });

  if (res.status === 403) throw new AccessDeniedError();
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Request failed — status ${res.status}`,
      res.status,
    );
  }

  return res.json() as Promise<T>;
}

// ── Analytics endpoints ───────────────────────────────────────

/**
 * GET /api/v1/analytics/dashboard
 * Fetches system-wide totals + per-company breakdown.
 * Corresponds to: QuotaAnalyticsController.getDashboard()
 *
 * @param token  JWT — pass from client; omit when called server-side
 *               (Next.js middleware will forward cookies automatically)
 */
export async function fetchDashboardData(
  token?: string,
): Promise<AnalyticsDashboardData> {
  return apiFetch<AnalyticsDashboardData>("/api/v1/analytics/dashboard", token);
}
