"use client";

import { useState, useEffect, Suspense } from "react";
import MinistrySidebar from "@/components/MinistrySidebar";
import {
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { getQuotaRequests } from "@/services/quotaService";
import { QuotaRequest } from "@/types/quota";

function MinistryDashboardContent() {
    const [pendingRequests, setPendingRequests] = useState<QuotaRequest[]>([]);
    const [totalPending, setTotalPending] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch first 5 pending requests
                const response = await getQuotaRequests({ companyName: '', status: 'PENDING', submissionDate: '' }, 1, 5);
                setPendingRequests(response.data);
                setTotalPending(response.totalRecords);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    // Derived stats
    // const stats = [
    //     { label: "Pending Apps", value: String(totalPending), icon: <Clock size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
    //     { label: "Approved (YTD)", value: "1,402", icon: <CheckCircle size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    //     { label: "Avg. Review Time", value: "2.4 Days", icon: <FileText size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    //     { label: "Active Companies", value: "85", icon: <ArrowUpRight size={20} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    // ];

    return (
        <div className="admin-theme" style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundImage: `url('/bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            <MinistrySidebar totalCount={totalPending} />

            <main className="main-content" style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(40px)',
                flex: 1,
                margin: '20px',
                borderRadius: '32px',
                padding: '32px 40px'
            }}>
                <div className="page-header" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '800px',
                    margin: '0 auto 32px auto',
                    textAlign: 'center',
                    padding: '20px 28px'
                }}>
                    <nav className="flex justify-center items-center gap-1 mb-1">
                        <span className="text-[10px] text-green-900/40 tracking-wider font-bold uppercase">Staff Workspace</span>
                    </nav>
                    <h2 style={{ fontSize: '28px', fontWeight: 900 }}>Ministry Operations Overview</h2>
                    <p>Real-time monitoring of environmental quota requests and departmental performance.</p>
                </div>

                {/* Stats Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-sm flex items-center gap-5">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div> */}

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[32px] border border-white shadow-xl min-h-[400px]">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Clock className="text-emerald-600" size={22} />
                                Recent Activity
                            </h3>
                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <RefreshCw className="animate-spin mb-4" size={32} />
                                        <p className="text-sm font-bold">Refreshing Queue...</p>
                                    </div>
                                ) : pendingRequests.length > 0 ? (
                                    pendingRequests.map(req => (
                                        <div key={req.id} className="flex gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100">
                                            <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-slate-800">#{req.request_id} — {req.company_name}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {new Date(req.submission_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                    Requested: <span className="font-bold text-emerald-600">{req.requested_quota.toLocaleString()} Tons</span> of industrial quota.
                                                </p>
                                            </div>
                                            <Link href={`/ministry/quota-requests/${req.id}`}>
                                                <ArrowUpRight size={16} className="text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer" />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                        <CheckCircle className="mb-4" size={32} />
                                        <p className="text-sm font-bold">All clear! No pending requests.</p>
                                    </div>
                                )}
                            </div>

                            {!isLoading && pendingRequests.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                                    <Link href="/ministry/quota-requests" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-widest">
                                        View All Pending Requests
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-emerald-900 text-emerald-50 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-2">Queue Status</h3>
                                <p className="text-sm text-emerald-200/80 mb-6">You have {totalPending} pending requests to review.</p>
                                <Link href="/ministry/quota-requests" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
                                    Open Request Queue
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                            <RefreshCw className="absolute -bottom-10 -right-10 size-48 text-emerald-800/30 rotate-12" />
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] border border-white/50 shadow-xl">
                            <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400">System Priority</h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800">
                                    <p className="text-[10px] font-black uppercase mb-1">Critical Alert</p>
                                    <p className="text-xs font-bold font-sans line-clamp-2">Environmental quota utilization exceeded threshold in several sectors.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="app-footer" style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>&copy; 2024 Ministry of Environment</span>
                    <a href="#" style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 600 }}>Help Center</a>
                </footer>
            </main>
        </div>
    );
}

export default function MinistryDashboardPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading dashboard...</div>}>
            <MinistryDashboardContent />
        </Suspense>
    );
}
