import { BookingCard } from "./BookingCard";
import { ServiceTicketResponse } from "@/services/serviceTicketService";

interface MyBookingsListProps {
    tickets: ServiceTicketResponse[];
    loading: boolean;
    onViewDirectory: () => void;
    onViewDetails: (ticketNumber: string) => void;
    onCancel: (id: number) => void;
}

/**
 * SRP: This component is only responsible for rendering the list of bookings 
 * and handling the empty state.
 */
export function MyBookingsList({ tickets, loading, onViewDirectory, onViewDetails, onCancel }: MyBookingsListProps) {
    if (!loading && tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-6">
                <div className="bg-gray-50 rounded-full p-6 mb-6">
                    <span className="material-symbols-outlined text-6xl text-gray-300">receipt_long</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Service Tickets Found</h3>
                <p className="text-gray-500 max-w-sm mb-8">You haven't raised any service tickets yet. Once you book a technician, your history will appear here.</p>
                <button 
                    onClick={onViewDirectory}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20"
                >
                    Find a Technician
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {tickets.map((ticket) => (
                <BookingCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onViewDetails={onViewDetails} 
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
}
