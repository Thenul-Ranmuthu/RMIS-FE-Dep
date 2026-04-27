// =============================================================
// components/analytics/ExportPanel.tsx
// Export UI panel — shown on the analytics dashboard.
// Handles Scenario 1 (CSV) and Scenario 2 (PDF).
// =============================================================

"use client";

import { useExport } from "@/hooks/useExport";
import type { ExportFormat } from "@/services/exportService";

interface ExportOption {
    format: ExportFormat;
    label: string;
    description: string;
    icon: string;
    accent: string;
    glow: string;
    tag: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
    {
        format: "CSV",
        label: "Export CSV",
        description: "Spreadsheet-ready data for Excel or Google Sheets",
        icon: "⊞",
        accent: "#3D8B6E",
        glow: "rgba(61,139,110,0.15)",
        tag: "Scenario 1",
    },
    {
        format: "PDF",
        label: "Export PDF",
        description: "Styled official report for documentation & compliance",
        icon: "⊟",
        accent: "#C8A96E",
        glow: "rgba(200,169,110,0.15)",
        tag: "Scenario 2",
    },
];

export default function ExportPanel() {
    const { isExporting, exportingFormat, exportError, lastExported, triggerExport, clearError } =
        useExport();

    return (
        <div
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025]
                 backdrop-blur-xl p-6"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-[#4A7C8E] block mb-1">
                        EXPORT · REPORTING
                    </span>
                    <h3 className="font-display text-base font-bold text-white tracking-tight mb-1">
                        Export Quota Data
                    </h3>
                    <p className="font-mono text-[11px] text-white/30">
                        Generate official reports for documentation &amp; compliance
                    </p>
                </div>

                {/* Status badge */}
                {isExporting && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-[#4A7C8E]/10 border border-[#4A7C8E]/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C8E] animate-pulse inline-block" />
                        <span className="font-mono text-[10px] text-white/40">
                            Generating {exportingFormat}…
                        </span>
                    </div>
                )}
            </div>

            {/* Export option cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {EXPORT_OPTIONS.map((opt) => {
                    const isThisExporting = isExporting && exportingFormat === opt.format;
                    const isThisDone = lastExported === opt.format;

                    return (
                        <ExportCard
                            key={opt.format}
                            option={opt}
                            isExporting={isThisExporting}
                            isDone={isThisDone}
                            isDisabled={isExporting && exportingFormat !== opt.format}
                            onExport={() => triggerExport(opt.format)}
                        />
                    );
                })}
            </div>

            {/* Error message */}
            {exportError && (
                <div
                    className="flex items-start gap-3 p-4 rounded-xl
                     bg-[#C96E6E]/10 border border-[#C96E6E]/25"
                >
                    <span className="text-[#C96E6E] text-sm mt-0.5 flex-shrink-0">⚠</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-[#C96E6E] leading-relaxed">
                            {exportError}
                        </p>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-white/30 hover:text-white/60 transition-colors text-sm flex-shrink-0"
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Info note */}
            <p className="font-mono text-[10px] text-white/20 mt-3 leading-relaxed">
                Files are generated fresh from live data. Large datasets may take a few seconds.
            </p>
        </div>
    );
}

// ── Export card sub-component ─────────────────────────────────

interface ExportCardProps {
    option: ExportOption;
    isExporting: boolean;
    isDone: boolean;
    isDisabled: boolean;
    onExport: () => void;
}

function ExportCard({ option, isExporting, isDone, isDisabled, onExport }: ExportCardProps) {
    return (
        <button
            onClick={onExport}
            disabled={isDisabled || isExporting}
            className="group relative text-left rounded-xl border border-white/[0.07]
                 bg-white/[0.02] p-5 transition-all duration-200
                 hover:border-white/[0.14] hover:bg-white/[0.045]
                 disabled:opacity-40 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-1 focus:ring-white/20"
            style={{
                boxShadow: isExporting || isDone
                    ? `0 0 20px ${option.glow}`
                    : undefined,
            }}
        >
            {/* Top row: icon + tag */}
            <div className="flex items-center justify-between mb-4">
                <span
                    className="text-xl w-9 h-9 rounded-lg border flex items-center justify-center
                     bg-white/[0.02] transition-colors"
                    style={{ color: option.accent, borderColor: option.accent + "55" }}
                >
                    {option.icon}
                </span>

                <span
                    className="font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full
                     border opacity-60"
                    style={{ color: option.accent, borderColor: option.accent + "44" }}
                >
                    {option.tag}
                </span>
            </div>

            {/* Label */}
            <p
                className="font-display text-sm font-bold mb-1 transition-colors"
                style={{ color: isDone ? option.accent : "rgba(255,255,255,0.85)" }}
            >
                {isDone ? "✓ Downloaded!" : isExporting ? "Generating…" : option.label}
            </p>

            {/* Description */}
            <p className="font-mono text-[10px] text-white/35 leading-relaxed">
                {option.description}
            </p>

            {/* Progress bar while exporting */}
            {isExporting && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
                    <div
                        className="h-full animate-progress-bar"
                        style={{ background: option.accent }}
                    />
                </div>
            )}

            {/* Bottom accent line (idle) */}
            {!isExporting && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl
                     opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ background: option.accent }}
                />
            )}
        </button>
    );
}