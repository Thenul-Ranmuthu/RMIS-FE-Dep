import { useState } from "react";
import { submitRating } from "@/services/serviceTicketService";

interface SubmitRatingModalProps {
    ticketId: number;
    technicianName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubmitRatingModal({ ticketId, technicianName, onClose, onSuccess }: SubmitRatingModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await submitRating(ticketId, rating, feedback);
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to submit rating.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-gray-50 px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">Rate Technician</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Review {technicianName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5 sm:p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100 mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">
                                Your Rating
                            </label>
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={starValue}
                                            className={`text-4xl transition-colors focus:outline-none ${
                                                starValue <= (hover || rating) ? "text-amber-400" : "text-gray-200"
                                            }`}
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHover(starValue)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "inherit" }}>
                                                {starValue <= (hover || rating) ? 'star' : 'star_border'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="feedback" className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                                Written Review (Optional)
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="How was your experience?"
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl p-4 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? "Submitting..." : "Submit Rating"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
