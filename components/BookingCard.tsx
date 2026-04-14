import { ServiceTicketResponse } from "@/services/serviceTicketService";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200"
};

interface BookingCardProps {
    ticket: ServiceTicketResponse;
    onViewDetails: (ticketNumber: string) => void;
    onCancel: (id: number) => void;
}

/**
 * SRP: This component is only responsible for rendering a single booking card.
 * OCP: The status styles are defined in a map, making it easy to add new statuses.
 */
export function BookingCard({ ticket, onViewDetails, onCancel }: BookingCardProps) {
    const statusStyle = STATUS_STYLES[ticket.status.toUpperCase()] || "bg-gray-100 text-gray-700 border-gray-200";
    const isCancelable = ticket.status.toUpperCase() === "PENDING";

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                            ID: {ticket.ticketNumber}
                        </span>
                        <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusStyle}`}>
                            {ticket.status.replace(/_/g, ' ')}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-black text-gray-900">{ticket.serviceType}</h3>
                        <p className="text-gray-600 mt-1 line-clamp-2 italic">
                            "{ticket.description}"
                        </p>
                        {ticket.status.toUpperCase() === "CANCELLED" && ticket.cancellationReason && (
                            <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-xl">
                                <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Cancellation Reason</p>
                                <p className="text-red-700 text-sm font-medium italic">"{ticket.cancellationReason}"</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-xl text-gray-500 shrink-0">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Technician</p>
                                <p className="text-gray-900 font-bold">{ticket.technicianName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-xl text-gray-500 shrink-0">
                                <span className="material-symbols-outlined text-xl">event</span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scheduled Date</p>
                                <p className="text-gray-900 font-bold">
                                    {new Date(ticket.scheduledDate).toLocaleDateString('en-US', { 
                                        month: 'long', day: 'numeric', year: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-48 lg:border-l lg:pl-6 flex flex-col justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span className="text-sm font-bold tracking-tight">
                            {ticket.scheduledStartTime && ticket.scheduledEndTime 
                                ? `${ticket.scheduledStartTime.substring(0, 5)} - ${ticket.scheduledEndTime.substring(0, 5)}`
                                : "Technician no longer available"
                            }
                        </span>
                    </div>
                    <button 
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition border border-gray-200"
                        onClick={() => onViewDetails(ticket.ticketNumber)}
                    >
                        View Details
                    </button>
                    {isCancelable && (
                        <button 
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition border border-red-100"
                            onClick={() => onCancel(ticket.id)}
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
