"use client";

import { QuotaRequest } from "@/types/quota";

interface ViewLogModalProps {
  request: QuotaRequest;
  onClose: () => void;
}

export default function ViewLogModal({ request, onClose }: ViewLogModalProps) {
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
          <div className="bg-red-100 rounded-xl p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Rejection Log</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Request #{request.request_id}
            </p>
          </div>
        </div>

        {/* Rejected badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Rejected
          </span>
        </div>

        {/* Request summary */}
        <div className="bg-gray-50 rounded-xl px-4 mb-6">
          <div className="flex justify-between items-start py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500 font-medium">Company</span>
            <span className="text-sm font-semibold text-gray-800">
              {request.company_name}
            </span>
          </div>
          <div className="flex justify-between items-start py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500 font-medium">
              Requested Quota
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {request.requested_quota.toLocaleString()} tons
            </span>
          </div>
          <div className="flex justify-between items-start py-3">
            <span className="text-sm text-gray-500 font-medium">Submitted</span>
            <span className="text-sm font-semibold text-gray-800">
              {new Date(request.submission_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Rejection log coming soon
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Detailed rejection reason and audit log functionality is currently
              under development.
            </p>
          </div>
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
