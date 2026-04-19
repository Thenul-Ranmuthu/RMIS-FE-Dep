// RMIS-FE/app/admin/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getRole } from '@/services/authService';
import { getAuditLogs } from '@/services/auditLogService';
import { AuditLog, AuditLogFilters } from '@/types/auditLog';
import AuditLogTable from '@/components/audit-log/AuditLogTable';
import AuditLogFiltersPanel from '@/components/audit-log/AuditLogFilters';
import UnauthorisedMessage from '@/components/audit-log/UnauthorisedMessage';
import Link from 'next/link';

const getDefaultFilters = (): AuditLogFilters => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthorised, setIsUnauthorised] = useState(false);
    const [filters, setFilters] = useState<AuditLogFilters>(getDefaultFilters());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = getToken();
        const role = getRole();
        if (!token) { router.push('/admin/auth/login'); return; }
        if (role !== 'ADMIN') { setIsUnauthorised(true); return; }
    }, []);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await getAuditLogs(filters);
                setData(result);
            } catch (err: any) {
                if (err?.status === 401 || err?.status === 403) setIsUnauthorised(true);
                else console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [filters]);

    const handleFilterChange = (newFilters: AuditLogFilters) => setFilters(newFilters);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        document.cookie = "accessToken=; path=/; max-age=0";
        router.push('/ministry');
    };

    const approvedCount = data.filter(l => l.action_type === 'APPROVED').length;
    const rejectedCount = data.filter(l => l.action_type === 'REJECTED').length;

    if (isUnauthorised) return <UnauthorisedMessage />;

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 h-screen z-30 lg:z-auto
                w-64 bg-[#0f172a] flex flex-col flex-shrink-0
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">
                            🛡️
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Ministry of Environment</p>
                            <p className="text-white/40 text-xs font-medium">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 py-2">Administration</p>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/10 text-white font-semibold text-sm mt-1 cursor-pointer">
                        <span>📋</span> Audit Logs
                    </div>
                </nav>

                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-300 font-semibold text-sm transition-colors"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition"
                    >
                        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-bold text-slate-800 text-sm">Audit Log</span>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Page title */}
                    <div className="mb-6 hidden lg:block">
                        <h1 className="text-2xl font-black text-slate-900">Audit Log</h1>
                        <p className="text-slate-500 text-sm mt-1">Track all officer approval and rejection actions on quota requests.</p>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { icon: '📋', label: 'Total Actions', value: data.length, bg: 'bg-white border-slate-200', labelColor: 'text-slate-400' },
                            { icon: '✅', label: 'Approved', value: approvedCount, bg: 'bg-green-50 border-green-200', labelColor: 'text-green-600' },
                            { icon: '❌', label: 'Rejected', value: rejectedCount, bg: 'bg-red-50 border-red-200', labelColor: 'text-red-500' },
                        ].map((card) => (
                            <div key={card.label} className={`${card.bg} border rounded-xl p-4 flex items-center gap-3`}>
                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">{card.icon}</div>
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wide ${card.labelColor}`}>{card.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{isLoading ? '—' : card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <AuditLogFiltersPanel onFilterChange={handleFilterChange} isLoading={isLoading} />

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <AuditLogTable data={data} isLoading={isLoading} />
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="mt-10 pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-slate-400 text-xs text-center sm:text-left">© 2024 Ministry of Environment. All Rights Reserved.</p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-slate-400 text-xs hover:text-slate-600 transition">Privacy Policy</Link>
                            <Link href="#" className="text-slate-400 text-xs hover:text-slate-600 transition">Help Center</Link>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
