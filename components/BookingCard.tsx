import { useState } from "react";
import { ServiceTicketResponse } from "@/services/serviceTicketService";
import { SubmitRatingModal } from "./SubmitRatingModal";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200"
};

interface BookingCardProps {
    ticket: ServiceTicketResponse;
    onCancel: (id: number) => void;
    onRatingSuccess: () => void;
}

/**
 * SRP: This component is only responsible for rendering a single booking card.
 * OCP: The status styles are defined in a map, making it easy to add new statuses.
 */
export function BookingCard({ ticket, onCancel, onRatingSuccess }: BookingCardProps) {
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    
    const statusStyle = STATUS_STYLES[ticket.status.toUpperCase()] || "bg-gray-100 text-gray-700 border-gray-200";
    const isCancelable = ticket.status.toUpperCase() === "PENDING";
    const isCompleted = ticket.status.toUpperCase() === "COMPLETED";

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            {/* Top Badge Row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                    ID: {ticket.ticketNumber}
                </span>
                <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusStyle}`}>
                    {ticket.status.replace(/_/g, ' ')}
                </div>
            </div>

            {/* Title & Description */}
            <div className="mb-6">
                <h3 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight">{ticket.serviceType}</h3>
                <p className="text-slate-500 mt-2 italic font-medium">
                    {ticket.description ? `"${ticket.description}"` : '"No notes provided"'}
                </p>
                {ticket.status.toUpperCase() === "CANCELLED" && ticket.cancellationReason && (
                    <div className="mt-4 bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Cancellation Reason</p>
                        <p className="text-red-700 text-sm font-medium italic">"{ticket.cancellationReason}"</p>
                    </div>
                )}
            </div>

            {/* Middle Section: 3-Column Info Bar */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
                {/* Technician */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border-2 border-white shadow-sm overflow-hidden">
                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Technician</p>
                        <p className="text-slate-800 font-bold text-sm leading-tight">{ticket.technicianName || "Expert Technician"}</p>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border-2 border-white shadow-sm">
                        <span className="material-symbols-outlined text-2xl">calendar_today</span>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Scheduled Date</p>
                        <p className="text-slate-800 font-bold text-sm leading-tight">
                            {new Date(ticket.scheduledDate).toLocaleDateString('en-US', { 
                                month: 'long', day: 'numeric', year: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border-2 border-white shadow-sm">
                        <span className="material-symbols-outlined text-2xl">schedule</span>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Time</p>
                        <p className="text-slate-800 font-bold text-sm leading-tight">
                            {ticket.scheduledStartTime && ticket.scheduledEndTime 
                                ? `${ticket.scheduledStartTime.substring(0, 5)} - ${ticket.scheduledEndTime.substring(0, 5)}`
                                : "N/A"
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                {isCompleted ? (
                    <div className="flex-1 bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm group/rating">
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-1 text-emerald-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="material-symbols-outlined text-xl">
                                        {ticket.rated ? "star" : "star_outline"}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                                How was the service provided by the technician?
                            </p>
                        </div>
                        <button 
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${
                                ticket.rated 
                                ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" 
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100 hover:scale-105 active:scale-95"
                            }`}
                            onClick={() => !ticket.rated && setIsRatingModalOpen(true)}
                            disabled={ticket.rated}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {ticket.rated ? 'check_circle' : 'star'}
                            </span>
                            {ticket.rated ? 'Already Rated' : 'Rate Technician'}
                        </button>
                    </div>
                ) : isCancelable ? (
                    <button 
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-red-100 active:scale-[0.98]"
                        onClick={() => onCancel(ticket.id)}
                    >
                        Cancel Booking
                    </button>
                ) : null}
            </div>
            {isRatingModalOpen && (
                <SubmitRatingModal 
                    ticketId={ticket.id}
                    technicianName={ticket.technicianName}
                    onClose={() => setIsRatingModalOpen(false)}
                    onSuccess={() => {
                        setIsRatingModalOpen(false);
                        onRatingSuccess();
                    }}
                />
            )}
        </div>
    );
}
