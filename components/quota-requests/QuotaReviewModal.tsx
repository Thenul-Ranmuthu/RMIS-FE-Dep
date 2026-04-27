// RMIS-FE/components/quota-requests/QuotaReviewModal.tsx

'use client';

import { useEffect, useState } from 'react';
import { QuotaRequestDetail, QuotaStatus } from '@/types/quota';
import { getQuotaRequestById } from '@/services/quotaService';
import { X, Building2, Mail, Hash, BarChart2, Calendar, User, Clock, ShieldCheck } from 'lucide-react';

interface QuotaReviewModalProps {
    id: string;           // UUID
    requestId: string;    // REQ-0001 for display
    onClose: () => void;
}

const StatusBadge = ({ status }: { status: QuotaStatus }) => {
    const styles: Record<QuotaStatus, { badge: string; dot: string; label: string }> = {
        PENDING: {
            badge: 'bg-amber-100 text-amber-800',
            dot: 'bg-amber-500',
            label: 'Pending',
        },
        APPROVED: {
            badge: 'bg-emerald-100 text-emerald-800',
            dot: 'bg-emerald-500',
            label: 'Approved',
        },
        REJECTED: {
            badge: 'bg-rose-100 text-rose-800',
            dot: 'bg-rose-500',
            label: 'Rejected',
        },
    };

    const s = styles[status];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.badge}`}>
            <span className={`size-2 rounded-full ${s.dot} mr-2`} />
            {s.label}
        </span>
    );
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <div className="text-sm font-medium text-slate-800">{value}</div>
        </div>
    </div>
);

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function QuotaReviewModal({ id, requestId, onClose }: QuotaReviewModalProps) {
    const [detail, setDetail] = useState<QuotaRequestDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await getQuotaRequestById(id);
                setDetail(result);
            } catch (err) {
                setError('Failed to load request details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quota Request</p>
                        <h2 className="text-xl font-black text-slate-900">{requestId || (detail as any)?.request_id || 'Details'}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col gap-3 py-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && !isLoading && (
                        <div className="py-8 text-center">
                            <p className="text-rose-500 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Detail */}
                    {detail && !isLoading && (
                        <>
                            {/* Status */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                                <span className="text-sm font-semibold text-slate-500">Current Status</span>
                                <StatusBadge status={detail.status} />
                            </div>

                            {/* Company Information */}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Company Information
                            </p>
                            <div className="bg-slate-50 rounded-xl px-4 mb-4">
                                <DetailRow
                                    icon={<Building2 size={16} />}
                                    label="Company Name"
                                    value={detail.company_name}
                                />
                                <DetailRow
                                    icon={<Mail size={16} />}
                                    label="Company Email"
                                    value={detail.company_email}
                                />
                                <DetailRow
                                    icon={<Hash size={16} />}
                                    label="Company ID"
                                    value={detail.company_id}
                                />
                            </div>

                            {/* Request Details */}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Request Details
                            </p>
                            <div className="bg-slate-50 rounded-xl px-4 mb-4">
                                <DetailRow
                                    icon={<BarChart2 size={16} />}
                                    label="Requested Quota"
                                    value={`${detail.requested_quota.toLocaleString()} Tons`}
                                />
                                <DetailRow
                                    icon={<Calendar size={16} />}
                                    label="Submission Date"
                                    value={formatDate(detail.submission_date)}
                                />
                            </div>

                            {/* Review Information */}
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Review Information
                            </p>
                            <div className="bg-slate-50 rounded-xl px-4 mb-2">
                                <DetailRow
                                    icon={<User size={16} />}
                                    label="Reviewed By"
                                    value={detail.reviewed_by ?? 'Not yet reviewed'}
                                />
                                <DetailRow
                                    icon={<Clock size={16} />}
                                    label="Reviewed At"
                                    value={detail.reviewed_at ? formatDate(detail.reviewed_at) : 'Not yet reviewed'}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
