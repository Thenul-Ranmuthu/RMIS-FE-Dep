"use client";

// components/quota-requests/QuotaTable.tsx

import { useState } from "react";
import { QuotaRequest, QuotaStatus } from "@/types/quota";
import ReviewModal from "./ReviewModal";
import DetailsModal from "./DetailsModal";
import ViewLogModal from "./ViewLogModal";

interface QuotaTableProps {
    data: QuotaRequest[];
    isLoading: boolean;
    onReview: (id: string, requestId: string) => void;
    onStatusChange?: () => void;
}

const StatusBadge = ({ status }: { status: QuotaStatus }) => {
    const styles: Record<QuotaStatus, { badge: string; dot: string; label: string }> = {
        PENDING: {
            badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
            dot: "bg-amber-500",
            label: "Pending",
        },
        APPROVED: {
            badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
            dot: "bg-emerald-500",
            label: "Approved",
        },
        REJECTED: {
            badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
            dot: "bg-rose-500",
            label: "Rejected",
        },
    };

    const s = styles[status] ?? styles["PENDING"];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
            <span className={`size-1.5 rounded-full ${s.dot} mr-1.5`} />
            {s.label}
        </span>
    );
};

// Loading skeleton rows
const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 6 }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            </td>
        ))}
    </tr>
);

export default function QuotaTable({ data, isLoading, onReview, onStatusChange }: QuotaTableProps) {
    const [reviewTarget, setReviewTarget] = useState<QuotaRequest | null>(null);
    const [detailsTarget, setDetailsTarget] = useState<QuotaRequest | null>(null);
    const [logTarget, setLogTarget] = useState<QuotaRequest | null>(null);
    const [toast, setToast] = useState<string>("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    };

    const handleReviewSuccess = (message: string) => {
        setReviewTarget(null);
        showToast(message);
        onStatusChange?.();
    };

    const handleActionClick = (row: QuotaRequest) => {
        // // Also call the parent onReview handler for the modal in page.tsx
        // onReview(row.id, row.request_id);

        // // Open the appropriate modal based on status
        // if (row.status === "PENDING") setReviewTarget(row);
        // else if (row.status === "APPROVED") setDetailsTarget(row);
        // else setLogTarget(row);
        if (row.status === "PENDING") {
            // PENDING → open ReviewModal (approve/reject)
            setReviewTarget(row);
        } else {
            // APPROVED or REJECTED → open QuotaReviewModal (detail view)
            onReview(row.id, row.request_id);
        }
    };

    const getActionLabel = (status: QuotaStatus) => {
        if (status === "PENDING") return "Review";
        if (status === "APPROVED") return "Details";
        return "View Log";
    };

    const getActionStyle = (status: QuotaStatus) => {
        if (status === "PENDING") return "text-amber-600 hover:text-amber-800";
        if (status === "APPROVED") return "text-emerald-600 hover:text-emerald-800";
        return "text-rose-500 hover:text-rose-700";
    };

    return (
        <>
            {/* Toast notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {toast}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            {["Request ID", "Company Name", "Requested Quota (Tons)", "Submission Date", "Status", "Actions"].map((col) => (
                                <th
                                    key={col}
                                    className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col === "Actions" ? "text-right" : ""}`}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                        {/* Loading state */}
                        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                        {/* Empty state */}
                        {!isLoading && data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <p className="font-semibold text-slate-500 dark:text-slate-400">
                                            No quota requests found
                                        </p>
                                        <p className="text-sm">Try adjusting your filters or check back later.</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data rows */}
                        {!isLoading && data.map((row) => {
                            return (
                            <tr
                                key={row.request_id}
                                className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                                onClick={() => onReview(row.id, row.request_id)}
                            >
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 border-b border-slate-50">
                                    #{row.request_id}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-slate-50">
                                    {row.company_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-slate-50">
                                    {row.requested_quota.toLocaleString()} Tons
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 border-b border-slate-50">
                                    {new Date(row.submission_date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </td>
                                <td className="px-6 py-4 border-b border-slate-50">
                                    <StatusBadge status={row.status} />
                                </td>
                                <td className="px-6 py-4 text-right border-b border-slate-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleActionClick(row);
                                        }}
                                        className={`font-bold text-sm transition-colors ${getActionStyle(row.status)}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {getActionLabel(row.status)}
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {/* Modals from RMIS-23 */}
            {reviewTarget && (
                <ReviewModal
                    request={reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
            {detailsTarget && (
                <DetailsModal
                    request={detailsTarget}
                    onClose={() => setDetailsTarget(null)}
                />
            )}
            {logTarget && (
                <ViewLogModal
                    request={logTarget}
                    onClose={() => setLogTarget(null)}
                />
            )}
        </>
    );
}
