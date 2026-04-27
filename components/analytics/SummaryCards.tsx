// =============================================================
// components/analytics/SummaryCards.tsx
// Scenario 1: Displays Total Approved / Used / Remaining quota.
// Pure presentational — receives data as props, no fetching.
// =============================================================

"use client";

import type { SystemQuotaSummary } from "@/types/analytics";
import { formatQuotaValue } from "@/services/chartTransformers";

interface SummaryCardsProps {
  summary: SystemQuotaSummary;
}

interface CardConfig {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: string;
  glowColor: string;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const remainingPct =
    summary.totalApprovedQuota > 0
      ? ((summary.totalRemainingQuota / summary.totalApprovedQuota) * 100).toFixed(1)
      : "0.0";

  const cards: CardConfig[] = [
    {
      label: "Total Approved Quota",
      value: formatQuotaValue(summary.totalApprovedQuota),
      sub: `${summary.totalApprovedRequests} approved requests`,
      accent: "#C8A96E",
      icon: "◈",
      glowColor: "rgba(200,169,110,0.15)",
    },
    {
      label: "Total Used Quota",
      value: formatQuotaValue(summary.totalUsedQuota),
      sub: `Across ${summary.totalCompanies} active companies`,
      accent: "#C96E6E",
      icon: "◉",
      glowColor: "rgba(201,110,110,0.15)",
    },
    {
      label: "Total Remaining Quota",
      value: formatQuotaValue(summary.totalRemainingQuota),
      sub: `${remainingPct}% of annual budget remaining`,
      accent: "#3D8B6E",
      icon: "◎",
      glowColor: "rgba(61,139,110,0.15)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-2xl border border-black/[0.05]
                     bg-white/80 backdrop-blur-xl p-6
                     hover:-translate-y-1 transition-all duration-300"
          style={{
            boxShadow: `0 4px 24px ${card.glowColor}`,
            animationDelay: `${i * 80}ms`,
          }}
        >
          {/* Icon badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       text-lg mb-4 bg-white shadow-sm"
            style={{ color: card.accent, border: `1px solid ${card.accent}33` }}
          >
            {card.icon}
          </div>

          {/* Label */}
          <p className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-green-900/40 mb-1.5">
            {card.label}
          </p>

          {/* Value */}
          <p
            className="font-display text-[1.75rem] font-bold tracking-tight mb-1.5"
            style={{ color: card.accent }}
          >
            {card.value}
          </p>

          {/* Sub-label */}
          <p className="font-sans text-[11px] font-semibold text-green-900/60">{card.sub}</p>

          {/* Bottom accent bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[4px] opacity-80"
            style={{ background: card.accent }}
          />
        </div>
      ))}
    </div>
  );
}