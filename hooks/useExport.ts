// =============================================================
// hooks/useExport.ts  (place in a hooks/ folder or alongside the component)
// Custom hook encapsulating export state — loading, error, success toast.
// SRP: only manages export interaction state.
// =============================================================

"use client";

import { useState, useCallback } from "react";
import { downloadQuotaExport, ExportError } from "@/services/exportService";
import type { ExportFormat } from "@/services/exportService";
import { getToken } from "@/services/authService";

interface UseExportReturn {
    isExporting: boolean;
    exportingFormat: ExportFormat | null;
    exportError: string | null;
    lastExported: ExportFormat | null;
    triggerExport: (format: ExportFormat) => Promise<void>;
    clearError: () => void;
}

export function useExport(): UseExportReturn {
    const [isExporting, setIsExporting] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [lastExported, setLastExported] = useState<ExportFormat | null>(null);

    const triggerExport = useCallback(async (format: ExportFormat) => {
        setIsExporting(true);
        setExportingFormat(format);
        setExportError(null);

        try {
            const token = getToken() ?? undefined;

            await downloadQuotaExport({ format, token });
            setLastExported(format);

            // Clear success indicator after 3s
            setTimeout(() => setLastExported(null), 3000);
        } catch (err) {
            const message = err instanceof ExportError
                ? err.message
                : "An unexpected error occurred during export.";
            setExportError(message);
        } finally {
            setIsExporting(false);
            setExportingFormat(null);
        }
    }, []);

    const clearError = useCallback(() => setExportError(null), []);

    return { isExporting, exportingFormat, exportError, lastExported, triggerExport, clearError };
}