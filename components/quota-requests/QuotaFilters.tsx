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
        <section className="bg-white p-6 border-b border-slate-100">
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-slate-800">
                    <span className="material-symbols-outlined text-emerald-600 font-bold">filter_alt</span>
                    <h3 className="font-bold text-lg tracking-tight">Filter Requests</h3>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap gap-5 items-end">
                    
                    {/* Company Name */}
                    <div className="flex flex-col gap-1.5 flex-[2]">
                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                            Company Name
                        </label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={local.companyName}
                                onChange={(e) => setLocal((prev) => ({ ...prev, companyName: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                            Status
                        </label>
                        <select
                            value={local.status}
                            onChange={(e) => setLocal((prev) => ({ ...prev, status: e.target.value as QuotaStatus | '' }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium appearance-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Submission Date */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                            Submission Date
                        </label>
                        <input
                            type="date"
                            value={local.submissionDate}
                            onChange={(e) => setLocal((prev) => ({ ...prev, submissionDate: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Clear Button */}
                    <div className="flex gap-2 min-w-[160px]">
                        <button
                            onClick={handleClear}
                            className="w-full px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
