"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MyBookingsList } from "@/components/MyBookingsList";
import { getMyTickets, cancelTicket, ServiceTicketResponse } from "../../../services/serviceTicketService";

/**
 * SRP: This page component is only responsible for page-level state management 
 * and orchestration of high-level sub-components.
 */
export default function MyBookingsPage() {
    const router = useRouter();
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
            setError("Failed to load your booking history. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        try {
            const reason = window.prompt("Reason for cancellation (optional):") || "Cancelled by user";
            await cancelTicket(id, reason);
            alert("Booking cancelled successfully.");
            fetchTickets(); // Refresh list
        } catch (err: any) {
            console.error("Error cancelling ticket:", err);
            alert(err.error || "Failed to cancel booking. Please try again.");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-['Public_Sans']">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold mb-2 flex items-center gap-1 transition"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
                        <p className="text-gray-500 mt-1">Track your service history and current ticket status</p>
                    </div>
                    <button 
                        onClick={fetchTickets}
                        disabled={loading}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>sync</span>
                        Refresh
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    {loading && tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            <p className="mt-4 text-gray-500 font-medium tracking-wide prose uppercase">Loading History...</p>
                        </div>
                    ) : (
                        <MyBookingsList 
                            tickets={tickets} 
                            loading={loading} 
                            onViewDirectory={() => router.push('/public/directory')}
                            onViewDetails={(ticketNum: string) => alert(`Details for ticket ${ticketNum}`)}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
