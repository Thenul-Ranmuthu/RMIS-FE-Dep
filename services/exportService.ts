// =============================================================
// services/exportService.ts
// Handles file download requests for CSV and PDF exports.
// Uses fetch with blob response — triggers browser download.
// =============================================================

export type ExportFormat = "CSV" | "PDF";

export interface ExportOptions {
  format: ExportFormat;
  token?: string;
}

export class ExportError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ExportError";
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://www.rmis.space/api";

/**
 * Fetches the export file from the backend and triggers a browser download.
 * GET /api/v1/export/quota?format=CSV|PDF
 *
 * The browser download is triggered by creating a temporary <a> element —
 * this works for both CSV and PDF without needing a separate window.
 */
export async function downloadQuotaExport({
  format,
  token,
}: ExportOptions): Promise<void> {
  // const headers: HeadersInit = {};
  // if (token) headers["Authorization"] = `Bearer ${token}`;

  const headers: HeadersInit = { "Content-Type": "application/json" };

  // Token passed explicitly (client) or picked from cookie/header (server)
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/export/quota?format=${format}`, {
    method: "GET",
    headers,
  });

  if (res.status === 403) {
    throw new ExportError("You do not have permission to export reports.", 403);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ExportError(
      body.message ?? `Export failed with status ${res.status}`,
      res.status,
    );
  }

  // ── Trigger browser download ──────────────────────────────
  const blob = await res.blob();

  // Extract filename from Content-Disposition header if present,
  // otherwise fall back to a sensible default
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filenameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
  const filename = filenameMatch
    ? filenameMatch[1]
    : `quota-report.${format.toLowerCase()}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
