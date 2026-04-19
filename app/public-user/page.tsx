"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyTickets, cancelTicket, ServiceTicketResponse } from "../../services/serviceTicketService";
import { MyBookingsList } from "@/components/MyBookingsList";

export default function PublicUserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<{ email: string; role: string } | null>(null);
    const [tickets, setTickets] = useState<ServiceTicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyTickets();
            setTickets(data);
        } catch (err: any) {
            console.error("Error fetching tickets:", err);
            setError("Failed to load your booking history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(userData));
        fetchTickets();
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        router.push('/');
    };

    const handleCancel = async (id: number) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        try {
            const reason = window.prompt("Reason for cancellation (optional):") || "Cancelled by user";
            await cancelTicket(id, reason);
            fetchTickets(); // Refresh list
        } catch (err: any) {
            console.error("Error cancelling ticket:", err);
            alert(err.error || "Failed to cancel booking.");
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 font-['Public_Sans'] relative flex flex-col md:flex-row">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
                 style={{ backgroundImage: 'url("/bg.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }} />

            {/* Sidebar - Glass Design */}
            <aside className="w-full md:w-80 backdrop-blur-3xl bg-[#0a2814]/60 border-b md:border-b-0 md:border-r border-white/10 flex flex-col p-6 md:p-8 shrink-0 z-10 text-white shadow-2xl relative">
                <div className="flex-1">
                    <div className="flex justify-center mb-8">
                        <div className="bg-emerald-500/20 rounded-[32px] p-6 border border-white/10 shadow-inner backdrop-blur-md">
                            <span className="material-symbols-outlined text-5xl text-emerald-400">account_circle</span>
                        </div>
                    </div>
                    
                    <div className="text-center mb-12">
                        <h1 className="text-2xl font-black tracking-tight text-slate-50">Public Portal</h1>
                        <p className="text-[10px] font-black text-emerald-400/60 mt-1 uppercase tracking-[0.3em]">Environment Ministry</p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 mb-10 border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             Verified Customer
                        </p>
                        <p className="text-slate-100 font-bold truncate text-sm">{user?.email}</p>
                    </div>

                    <nav className="space-y-3">
                        <button
                            onClick={() => router.push('/public/directory')}
                            className="w-full flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40"
                        >
                            <span className="material-symbols-outlined">add_task</span>
                            Book Service
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/5 px-6 py-4 rounded-2xl font-bold text-sm transition-all"
                        >
                            <span className="material-symbols-outlined">power_settings_new</span>
                            Sign Out
                        </button>
                    </nav>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5">
                   <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">RMIS v2.1.0-STABLE</p>
                </div>
            </aside>

            {/* Main Content - Minimalist Grid */}
            <section className="flex-1 p-5 md:p-12 max-w-6xl z-10 relative overflow-y-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="h-1 w-12 bg-emerald-600 rounded-full" />
                             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Activity Monitor</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Service History</h2>
                        <p className="text-slate-500 mt-2 font-medium tracking-wide">Manage and track your active environment service tickets</p>
                    </div>
                    {tickets.length > 0 && (
                        <button 
                            onClick={fetchTickets}
                            disabled={loading}
                            className="bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-black/5 disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>sync</span>
                            Refresh Stats
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-700 p-5 rounded-3xl mb-12 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <span className="material-symbols-outlined text-red-500 text-3xl">report</span>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest mb-1">Error Occurred</p>
                            <p className="text-sm font-medium opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                <div className="min-h-[600px] pb-20">
                    {loading && tickets.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full border-t-4 border-emerald-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-3 w-3 bg-emerald-600 rounded-full animate-ping" />
                                </div>
                            </div>
                            <p className="mt-6 text-[10px] font-black text-emerald-800 uppercase tracking-[0.5em]">Syncing Data</p>
                        </div>
                    ) : (
                        <MyBookingsList 
                            tickets={tickets} 
                            loading={loading} 
                            onViewDirectory={() => router.push('/public/directory')}
                            onViewDetails={(num) => alert(`Ticket ${num} is being processed.`)}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            </section>
        </main>
    );
}