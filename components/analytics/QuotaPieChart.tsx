"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";
import type { PieChartDataPoint } from "@/types/analytics";
import { formatQuotaValue } from "@/services/chartTransformers";

interface QuotaPieChartProps {
  data: PieChartDataPoint[];
  title: string;
  subtitle: string;
  tagColor: string;
}

// Better typed active shape
interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill?: string;
  payload?: PieChartDataPoint;
  value: number;
}

function renderActiveShape(props: ActiveShapeProps) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props;

  return (
    <g>
      {/* Center Value */}
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fill="#000"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "1.05rem",
          fontWeight: 700,
        }}
      >
        {formatQuotaValue(value)}
      </text>

      {/* Percentage */}
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fill="rgba(0,0,0,0.45)"
        style={{ fontFamily: "monospace", fontSize: "0.62rem" }}
      >
        {payload?.percentage ?? 0}%
      </text>

      {/* Label */}
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fill="rgba(0,0,0,0.35)"
        style={{ fontFamily: "monospace", fontSize: "0.58rem" }}
      >
        {payload?.name ?? ""}
      </text>

      {/* Highlight */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.35}
      />
    </g>
  );
}

export default function QuotaPieChart({
  data,
  title,
  subtitle,
  tagColor,
}: QuotaPieChartProps) {
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  const hasData = data && data.length > 0;

  return (
    <div className="rounded-2xl border border-black/5 bg-white/40 backdrop-blur-xl p-6">

      {/* Header */}
      <span
        className="font-arial text-[10px] tracking-[0.14em] block mb-1"
        style={{ color: tagColor }}
      >
        PIE CHART
      </span>

      <h3 className="font-display text-base font-bold text-black tracking-tight mb-1">
        {title}
      </h3>

      <p className="font-arial text-[11px] text-black/30 mb-2">
        {subtitle}
      </p>

      {/* Empty state */}
      {!hasData ? (
        <div className="h-[210px] flex items-center justify-center text-black/30 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              {...({
                activeIndex: activeIdx >= 0 ? activeIdx : undefined,
                activeShape: renderActiveShape,
                data,
                cx: "50%",
                cy: "50%",
                innerRadius: 62,
                outerRadius: 92,
                dataKey: "value",
                onMouseEnter: (_: unknown, idx: number) => {
                  setActiveIdx(idx);
                },
                onMouseLeave: () => setActiveIdx(-1),
              } as any)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.fill}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      {hasData && (
        <div className="mt-3 pt-3 border-t border-black/5 flex flex-col gap-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2.5">

              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: entry.fill }}
              />

              <span
                className="font-arial text-[10px] text-black/45 flex-1 truncate"
                title={entry.name}
              >
                {entry.name}
              </span>

              <span
                className="font-display text-sm font-semibold"
                style={{ color: entry.fill }}
              >
                {formatQuotaValue(entry.value)}
              </span>

              <span className="font-arial text-[10px] text-black/25 w-9 text-right">
                {entry.percentage ?? 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}