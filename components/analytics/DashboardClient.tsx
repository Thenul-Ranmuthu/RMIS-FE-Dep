// =============================================================
// components/analytics/DashboardClient.tsx
// "use client" — receives server-fetched data as props,
// owns refresh state and all interactive chart behaviour.
//
// This is the boundary between Server and Client rendering:
//   app/analytics/page.tsx  (Server) → DashboardClient (Client)
// =============================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchDashboardData, AccessDeniedError } from "@/services/analyticsService";
import { getToken } from "@/services/authService";
import {
  toBarChartData,
  toSystemPieData,
  toCompanyPieData,
  formatGeneratedAt,
} from "@/services/chartTransformers";
import type { AnalyticsDashboardData } from "@/types/analytics";

import SummaryCards from "@/components/analytics/SummaryCards";
import QuotaBarChart from "@/components/analytics/QuotaBarChart";
import QuotaPieChart from "@/components/analytics/QuotaPieChart";
import CompanyBreakdownTable from "@/components/analytics/CompanyBreakdownTable";
import AccessDeniedState from "@/components/analytics/AccessDeniedState";
import ErrorState from "@/components/analytics/ErrorState";
import EmptyState from "@/components/analytics/EmptyState";
import { useExport } from "@/hooks/useExport";

interface DashboardClientProps {
  /** Pre-fetched by the Server Component; null means server already failed */
  initialData: AnalyticsDashboardData | null;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  const { isExporting, exportingFormat, exportError, lastExported, triggerExport, clearError } = useExport();

  // Client-side refresh (user clicks "↻ Refresh")
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsAccessDenied(false);

    try {
      const token = getToken() ?? undefined;
      const fresh = await fetchDashboardData(token);
      setData(fresh);
    } catch (err) {
      if (err instanceof AccessDeniedError) {
        setIsAccessDenied(true);
      } else {
        setError(err instanceof Error ? err.message : "Refresh failed.");
      }
    } finally {
      setIsRefreshing(false);
      setHasFetchedInitialData(true);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedInitialData) {
      handleRefresh();
    }
  }, [hasFetchedInitialData, handleRefresh]);

  // ── Derived chart data ──────────────────────────────────────
  const barData = data ? toBarChartData(data.companyBreakdowns) : [];
  const systemPie = data ? toSystemPieData(data) : [];
  const companyPie = data ? toCompanyPieData(data.companyBreakdowns) : [];

  // ── Render states ───────────────────────────────────────────
  if (isAccessDenied) return <AccessDeniedState />;
  if (error) return <ErrorState message={error} onRetry={handleRefresh} />;
  if (!hasFetchedInitialData) {
    return (
      <div className="py-16 text-center text-black/40">
        Loading analytics dashboard…
      </div>
    );
  }
  if (!data || data.companyBreakdowns.length === 0) return <EmptyState />;

  return (
    <div>
      {/* ── Page header ────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <nav className="flex items-center gap-1 mb-1" aria-label="Breadcrumb">
              <span className="text-[10px] text-green-900/40 tracking-wide font-arial uppercase font-bold">Ministry Portal</span>
              <span className="text-green-900/20 text-xs">›</span>
              <span className="text-[10px] text-green-700 tracking-wide font-arial font-bold uppercase">Analytics</span>
            </nav>
            <h2 className="text-[#1a4a38] font-bold text-2xl" style={{ margin: 0 }}>Gas Quota Analytics</h2>
            <p className="text-[#1a4a38]/70 text-sm" style={{ margin: 0 }}>System-wide distribution monitoring & regulatory oversight</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Live badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a4a38]/10 border border-[#1a4a38]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a38] animate-pulse inline-block" />
                <span className="font-sans text-[11px] font-bold text-[#1a4a38]/70">
                  Updated {formatGeneratedAt(data.generatedAt)}
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-1.5 bg-[#1a4a38] text-white rounded-lg
                           text-xs font-bold tracking-wide
                           hover:bg-[#123528] transition-colors disabled:opacity-40"
              >
                {isRefreshing ? "Loading…" : "↻ Refresh"}
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col items-end gap-2 mt-1">
                <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerExport("CSV")}
                      disabled={isExporting}
                      className={`px-3 py-1.5 border border-[#1a4a38]/30 rounded-lg
                                 text-[11px] font-bold tracking-wide flex items-center gap-1.5
                                 hover:bg-[#1a4a38]/5 transition-colors disabled:opacity-40
                                 ${lastExported === "CSV" ? "bg-green-100 text-[#3D8B6E] border-[#3D8B6E]" : "text-[#1a4a38]"}`}
                    >
                      {isExporting && exportingFormat === "CSV" ? "..." : lastExported === "CSV" ? "✓" : "⊞"} 
                      {lastExported === "CSV" ? "CSV Downloaded" : "Export as CSV"}
                    </button>
                    <button
                      onClick={() => triggerExport("PDF")}
                      disabled={isExporting}
                      className={`px-3 py-1.5 border border-[#1a4a38]/30 rounded-lg
                                 text-[11px] font-bold tracking-wide flex items-center gap-1.5
                                 hover:bg-[#1a4a38]/5 transition-colors disabled:opacity-40
                                 ${lastExported === "PDF" ? "bg-green-100 text-[#3D8B6E] border-[#3D8B6E]" : "text-[#1a4a38]"}`}
                    >
                      {isExporting && exportingFormat === "PDF" ? "..." : lastExported === "PDF" ? "✓" : "⊟"} 
                      {lastExported === "PDF" ? "PDF Downloaded" : "Export as PDF"}
                    </button>
                </div>
                
                {exportError && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-50 border border-red-100 mt-1">
                        <span className="text-[10px] text-red-600 font-medium">{exportError}</span>
                        <button onClick={clearError} className="text-red-400 hover:text-red-600">
                           <span className="text-[12px]">✕</span>
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scenario 1: Summary stat cards ─────────────────── */}
      <SummaryCards summary={data.systemSummary} />

      {/* ── Scenario 2: Charts ─────────────────────────────── */}
      {/* Bar chart — full width */}
      <div className="mb-5">
        <QuotaBarChart data={barData} />
      </div>

      {/* Pie charts — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <QuotaPieChart
          data={systemPie}
          title="System Usage Split"
          subtitle="Used vs remaining across all companies"
          tagColor="#4A7C8E"
        />
        <QuotaPieChart
          data={companyPie}
          title="Approved Quota Share"
          subtitle="Each company's share of the annual budget"
          tagColor="#7E5A9B"
        />
      </div>

      {/* Per-company detail table */}
      <CompanyBreakdownTable breakdowns={data.companyBreakdowns} />
    </div>
  );
}