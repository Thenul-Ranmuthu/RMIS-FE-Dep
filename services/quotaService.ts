// RMIS-FE/services/quotaService.ts

import {
  QuotaFilters,
  QuotaPaginatedResponse,
  QuotaRequestDetail,
} from "@/types/quota";
import { getToken } from "@/services/authService";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";

// ── Helper: build auth headers ─────────────────────────────────────────────
const authHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token ?? getToken()}`,
});

// ─── Interfaces (company-side) ────────────────────────────────────────────

export interface CompanyQuotaRequest {
  id?: number | string;
  requestId?: string; // ← add
  requestNumber?: string; // ← add
  submissionDate?: string;
  companyEmail?: string;
  requestedQuota: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface QuotaSummary {
  currentAvailableQuota: number | null;
  remainingYearlyQuota: number | null;
}

export interface QuotaListResponse {
  summary: QuotaSummary;
  requests: CompanyQuotaRequest[];
}

export interface AddQuotaPayload {
  companyEmail: string;
  requestedQuota: number;
  requestReason: string;
}

// ─── Company-side response parser ─────────────────────────────────────────

const parseQuotaListResponse = (data: unknown): QuotaListResponse => {
  if (Array.isArray(data)) {
    return {
      summary: { currentAvailableQuota: null, remainingYearlyQuota: null },
      requests: data as CompanyQuotaRequest[],
    };
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const requests: CompanyQuotaRequest[] = Array.isArray(obj.quotas)
      ? (obj.quotas as CompanyQuotaRequest[])
      : Array.isArray(obj.quotaRequests)
        ? (obj.quotaRequests as CompanyQuotaRequest[])
        : Array.isArray(obj.data)
          ? (obj.data as CompanyQuotaRequest[])
          : [];
    const summary: QuotaSummary = {
      currentAvailableQuota:
        typeof obj.currentAvailableQuota === "number"
          ? obj.currentAvailableQuota
          : typeof obj.availableQuota === "number"
            ? obj.availableQuota
            : null,
      remainingYearlyQuota:
        typeof obj.remainingYearlyQuota === "number"
          ? obj.remainingYearlyQuota
          : typeof obj.yearlyQuota === "number"
            ? obj.yearlyQuota
            : null,
    };
    return { summary, requests };
  }
  return {
    summary: { currentAvailableQuota: null, remainingYearlyQuota: null },
    requests: [],
  };
};

// ─── Company-side API ─────────────────────────────────────────────────────

export const getQuotas = async (token: string): Promise<QuotaListResponse> => {
  // fix 1: changed /quotaHeader/getQuotas to /company/getQuotas
  const response = await fetch(`${BASE_URL}/company/getQuotas`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = new Error(`Failed to fetch quotas: ${response.status}`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : [];
  return parseQuotaListResponse(data);
};

// fix 2: added missing getQuotaDetails function
export const getQuotaDetails = async (
  token: string,
): Promise<{ quota: number; remainingQuota: number }> => {
  const response = await fetch(`${BASE_URL}/company/getQuotaDetails`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = new Error(`Failed to fetch quota details: ${response.status}`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }
  return response.json();
};

export const addQuota = async (
  token: string,
  payload: AddQuotaPayload,
): Promise<unknown> => {
  const response = await fetch(`${BASE_URL}/quotaHeader/addQuota`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const errorText = await response.text(); // renamed to errorText
      try {
        const err = JSON.parse(errorText);
        message = err.message || err.error || errorText;
      } catch {
        message = errorText;
      }
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

// ─── Ministry-side API ────────────────────────────────────────────────────

export const getQuotaRequests = async (
  filters: QuotaFilters,
  page: number = 1,
  pageSize: number = 5,
): Promise<QuotaPaginatedResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(pageSize));

  if (filters.companyName) params.set("company_name", filters.companyName);
  if (filters.status) params.set("status", filters.status);
  if (filters.submissionDate)
    params.set("submission_date", filters.submissionDate);

  const hasFilters =
    filters.companyName || filters.status || filters.submissionDate;
  const endpoint = hasFilters ? "filter" : "paginated";
  const url = `${BASE_URL}/ministry/quota-requests/${endpoint}?${params}`;

  const response = await fetch(url, { headers: authHeaders() });

  if (!response.ok) {
    const text = await response.text();
    console.error("Status:", response.status, "Body:", text);
    throw new Error("Failed to fetch quota requests");
  }

  return response.json();
};

export const getQuotaRequestById = async (
  id: string,
): Promise<QuotaRequestDetail> => {
  const url = `${BASE_URL}/ministry/quota-requests/${id}`;
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch quota request detail");
  return response.json();
};

export const approveRequest = async (
  token: string,
  id: string,
): Promise<string> => {
  const response = await fetch(
    `${BASE_URL}/ministry/quota-requests/statusApprove/${id}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Approval failed: ${response.status}`);
  }
  return text;
};

export const rejectRequest = async (
  token: string,
  id: string,
): Promise<string> => {
  const response = await fetch(
    `${BASE_URL}/ministry/quota-requests/statusReject/${id}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Rejection failed: ${response.status}`);
  }
  return text;
};
