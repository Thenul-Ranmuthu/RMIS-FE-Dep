// RMIS-FE/services/auditLogService.ts

import { AuditLog, AuditLogFilters } from "@/types/auditLog";
import { getToken } from "@/services/authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const getAuditLogs = async (
  filters: AuditLogFilters,
): Promise<AuditLog[]> => {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  const url = `${BASE_URL}/admin/audit-logs?${params}`;
  const response = await fetch(url, { headers: authHeaders() });

  // 401 or 403 — throw with status so the page can handle it
  if (response.status === 401 || response.status === 403) {
    const err = new Error("Unauthorised");
    (err as any).status = response.status;
    throw err;
  }

  if (!response.ok) throw new Error("Failed to fetch audit logs");

  return response.json();
};
