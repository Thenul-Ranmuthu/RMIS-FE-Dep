"use client";

import { QuotaRequest } from "@/types/quota";

interface DetailsModalProps {
  request: QuotaRequest;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">
      {value}
    </span>
  </div>
);

const formatDate = (val?: string) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return val;
  }
};

export default function DetailsModal({ request, onClose }: DetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 rounded-xl p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Request Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Approved quota request information
            </p>
          </div>
        </div>

        {/* Approved badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl px-4 mb-6">
          <Row label="Request ID" value={`#${request.request_id}`} />
          {request.request_number && (
            <Row label="Request Number" value={request.request_number} />
          )}
          <Row label="Company Name" value={request.company_name} />
          {request.company_id !== undefined && (
            <Row label="Company ID" value={String(request.company_id)} />
          )}
          <Row
            label="Requested Quota"
            value={`${request.requested_quota.toLocaleString()} tons`}
          />
          <Row
            label="Submission Date"
            value={formatDate(request.submission_date)}
          />
          {request.reviewed_at && (
            <Row label="Reviewed At" value={formatDate(request.reviewed_at)} />
          )}
          {request.reviewed_by && (
            <Row label="Reviewed By" value={request.reviewed_by} />
          )}
          {request.created_at && (
            <Row label="Created At" value={formatDate(request.created_at)} />
          )}
          {request.updated_at && (
            <Row label="Last Updated" value={formatDate(request.updated_at)} />
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-bold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
