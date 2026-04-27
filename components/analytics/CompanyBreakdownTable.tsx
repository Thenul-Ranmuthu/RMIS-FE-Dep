// =============================================================
// components/analytics/CompanyBreakdownTable.tsx
// Per-company data table with inline usage-rate bars.
// Pure presentational — no fetching, no state.
// =============================================================

"use client";

import type { CompanyQuotaBreakdown } from "@/types/analytics";
import { formatQuotaValue } from "@/services/chartTransformers";

interface CompanyBreakdownTableProps {
  breakdowns: CompanyQuotaBreakdown[];
}

export default function CompanyBreakdownTable({ breakdowns }: CompanyBreakdownTableProps) {
  return (
    <div className="rounded-2xl border border-black/[0.05] bg-white/80
                    backdrop-blur-xl p-6 shadow-sm">
      {/* Header */}
      <span className="font-sans text-[10px] font-bold tracking-[0.14em] text-[#7E5A9B] block mb-1">
        TABLE · PER-COMPANY DETAIL
      </span>
      <h3 className="font-display text-base font-bold text-[#0d2b1f] tracking-tight mb-4">
        Company Quota Detail
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Company", "Reg. No.", "Allocated", "Used", "Remaining", "Usage Rate"].map(
                (h) => (
                  <th
                    key={h}
                    className="font-sans text-[9px] font-bold tracking-[0.1em] uppercase
                               text-[#3d5a4e]/50 text-left px-3 py-2
                               border-b border-black/[0.05] whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {breakdowns.map((row, i) => (
              <tr
                key={row.companyId}
                className={i % 2 === 0 ? "bg-white/[0.015]" : ""}
              >
                {/* Company name */}
                <td className="px-3 py-3 border-b border-black/[0.04] font-display
                               text-sm font-semibold text-[#1a2e25] whitespace-nowrap">
                  {row.companyName}
                </td>

                {/* Registration number */}
                <td className="px-3 py-3 border-b border-black/[0.04] font-arial
                               text-[11px] text-green-900/40 whitespace-nowrap">
                  {row.registrationNumber}
                </td>

                {/* Allocated (company share of annual budget) */}
                <td className="px-3 py-3 border-b border-black/[0.04] font-arial
                               text-[11px] text-[#C8A96E] whitespace-nowrap font-bold">
                  {formatQuotaValue(row.approvedQuota)}
                </td>

                {/* Used (sum of approved request amounts) */}
                <td className="px-3 py-3 border-b border-black/[0.04] font-arial
                               text-[11px] text-[#C96E6E] whitespace-nowrap font-bold">
                  {formatQuotaValue(row.usedQuota)}
                </td>

                {/* Remaining */}
                <td className="px-3 py-3 border-b border-black/[0.04] font-arial
                               text-[11px] text-[#3D8B6E] whitespace-nowrap font-bold">
                  {formatQuotaValue(row.remainingQuota)}
                </td>

                {/* Usage rate bar */}
                <td className="px-3 py-3 border-b border-black/[0.04] min-w-[150px]">
                  <UsageBar percentage={row.usagePercentage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Usage bar sub-component ───────────────────────────────────

function UsageBar({ percentage }: { percentage: number }) {
  const clamped = Math.min(percentage, 100);
  const color =
    clamped > 85 ? "#C96E6E" : clamped > 60 ? "#C8A96E" : "#3D8B6E";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <span
        className="font-arial text-[11px] min-w-[38px] text-right font-bold"
        style={{ color }}
      >
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}