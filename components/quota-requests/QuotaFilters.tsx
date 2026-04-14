// RMIS/files/components/quota-requests/QuotaFilters.tsx

'use client';

import { useState, useEffect } from 'react';
import { QuotaFilters, QuotaStatus } from '@/types/quota';

interface QuotaFiltersProps {
    filters: QuotaFilters;
    onFilterChange: (filters: QuotaFilters) => void;
}

const EMPTY_FILTERS: QuotaFilters = {
    companyName: '',
    status: '',
    submissionDate: '',
};

export default function QuotaFiltersPanel({ filters, onFilterChange }: QuotaFiltersProps) {
    const [local, setLocal] = useState<QuotaFilters>(filters);
    const [debouncedName, setDebouncedName] = useState('');

    // Sync local state with props
    useEffect(() => {
        setLocal(filters);
        setDebouncedName(filters.companyName);
    }, [filters]);

    // Debounce company name — waits 400ms after user stops typing before firing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedName(local.companyName), 400);
        return () => clearTimeout(timer);
    }, [local.companyName]);

    // Fire onFilterChange whenever debounced name, status, or date changes
    useEffect(() => {
        onFilterChange({ ...local, companyName: debouncedName });
    }, [debouncedName, local.status, local.submissionDate]);

    const handleClear = () => {
        const cleared = EMPTY_FILTERS;
        setLocal(cleared);
        setDebouncedName('');
        onFilterChange(cleared);
    };

    return (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-2">
                    <span className="material-symbols-outlined">filter_list</span>
                    <h3 className="font-bold text-lg">Filter Requests</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

                    {/* Company Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Company Name
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={local.companyName}
                                onChange={(e) => setLocal((prev) => ({ ...prev, companyName: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Status
                        </label>
                        <select
                            value={local.status}
                            onChange={(e) => setLocal((prev) => ({ ...prev, status: e.target.value as QuotaStatus | '' }))}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white appearance-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Submission Date */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Submission Date
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                calendar_today
                            </span>
                            <input
                                type="date"
                                value={local.submissionDate}
                                onChange={(e) => setLocal((prev) => ({ ...prev, submissionDate: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Clear Button */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">restart_alt</span>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}