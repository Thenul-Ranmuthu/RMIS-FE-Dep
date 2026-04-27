// =============================================================
// components/analytics/QuotaBarChart.tsx
// Scenario 2: Per-company bar chart (Approved / Used / Remaining).
// "use client" required — Recharts uses browser DOM APIs.
// =============================================================

"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { BarChartDataPoint } from "@/types/analytics";

interface QuotaBarChartProps {
  data: BarChartDataPoint[];
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 border border-black/12 rounded-xl px-4 py-3
                    backdrop-blur-xl min-w-[180px]">
      <p className="font-display text-sm text-black font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
          <span className="font-arial text-[11px] text-black/45 flex-1">{entry.name}</span>
          <span className="font-arial text-[11px] font-semibold" style={{ color: entry.fill }}>
            {entry.value.toFixed(1)}K ton
          </span>
        </div>
      ))}
    </div>
  );
}

export default function QuotaBarChart({ data }: QuotaBarChartProps) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/40
                    backdrop-blur-xl p-6">
      {/* Header */}
      <span className="font-arial text-[10px] tracking-[0.15em] text-[#C8A96E] block mb-1">
        BAR CHART · PER-COMPANY
      </span>
      <h3 className="font-display text-lg font-bold text-black tracking-tight mb-1">
        Per-Company Quota Breakdown
      </h3>
      <p className="font-arial text-[11px] text-black/30 mb-5">
        Approved vs Used vs Remaining — values in thousands ton (K)
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 16, left: 0, bottom: 48 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="company"
            tick={{ fill: "rgba(0,0,0,0.45)", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => `${v}K`}
            tick={{ fill: "rgba(0,0,0,0.35)", fontSize: 9, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
          <Legend
            wrapperStyle={{
              paddingTop: "1rem",
              fontFamily: "monospace",
              fontSize: "10px",
              color: "rgba(0,0,0,0.5)",
            }}
          />
          <Bar dataKey="approved" name="Approved" fill="#C8A96E" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="used" name="Used" fill="#C96E6E" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="remaining" name="Remaining" fill="#3D8B6E" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}