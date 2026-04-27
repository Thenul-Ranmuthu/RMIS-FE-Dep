import { useEffect, useState } from "react";
import { getTechnicianFeedbacks, ServiceRatingResponse } from "@/services/serviceTicketService";

interface ReviewsModalProps {
    technicianId: number;
    technicianName: string;
    onClose: () => void;
}

export function ReviewsModal({ technicianId, technicianName, onClose }: ReviewsModalProps) {
    const [reviews, setReviews] = useState<ServiceRatingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getTechnicianFeedbacks(technicianId);
                // Filter out reviews without text feedback
                const textReviews = data.filter(r => r.feedback && r.feedback.trim() !== "");
                setReviews(textReviews);
            } catch (err: any) {
                setError(err.message || "Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [technicianId]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]">
                <div className="bg-gray-50 px-5 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">Client Reviews</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">for {technicianName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-4 sm:p-8 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
                            {error}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-3 text-gray-300">chat_bubble_outline</span>
                            <p className="font-medium">No written reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{review.reviewerName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-sm">
                                                    {i < review.rating ? 'star' : 'star_border'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 italic">"{review.feedback}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
