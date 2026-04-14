// RMIS-FE/components/audit-log/AuditLogFilters.tsx

'use client';

import { useState } from 'react';
import { AuditLogFilters } from '@/types/auditLog';

interface AuditLogFiltersProps {
    onFilterChange: (filters: AuditLogFilters) => void;
    isLoading: boolean;
}

// Default: last 30 days
const getDefaultFilters = (): AuditLogFilters => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
};

export default function AuditLogFiltersPanel({ onFilterChange, isLoading }: AuditLogFiltersProps) {
    const [local, setLocal] = useState<AuditLogFilters>(getDefaultFilters());
    const [error, setError] = useState<string | null>(null);

    const handleApply = () => {
        if (!local.from || !local.to) {
            setError('Please select both a start and end date.');
            return;
        }
        if (new Date(local.from) > new Date(local.to)) {
            setError('Start date cannot be after end date.');
            return;
        }
        setError(null);
        onFilterChange(local);
    };

    const handleClear = () => {
        const defaults = getDefaultFilters();
        setLocal(defaults);
        setError(null);
        onFilterChange(defaults);
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 18 }}>🗓️</span>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', margin: 0 }}>
                    Filter by Date Range
                </h3>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>

                {/* From Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                        From Date
                    </label>
                    <input
                        type="date"
                        value={local.from}
                        onChange={(e) => setLocal((prev) => ({ ...prev, from: e.target.value }))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 14,
                            color: '#1e293b',
                            backgroundColor: '#f8fafc',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* To Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                        To Date
                    </label>
                    <input
                        type="date"
                        value={local.to}
                        onChange={(e) => setLocal((prev) => ({ ...prev, to: e.target.value }))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 14,
                            color: '#1e293b',
                            backgroundColor: '#f8fafc',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleApply}
                        disabled={isLoading}
                        style={{
                            backgroundColor: '#1e293b',
                            color: '#fff',
                            fontWeight: 700,
                            padding: '9px 20px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1,
                            fontSize: 14,
                        }}
                    >
                        {isLoading ? 'Loading...' : 'Apply'}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isLoading}
                        style={{
                            backgroundColor: '#fff',
                            color: '#64748b',
                            fontWeight: 600,
                            padding: '9px 20px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: 14,
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Validation error */}
            {error && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 500 }}>
                    {error}
                </p>
            )}
        </div>
    );
}