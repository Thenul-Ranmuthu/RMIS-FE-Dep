// =============================================================
// components/analytics/EmptyState.tsx
// Shown when the API returns successfully but no quota data exists yet.
// =============================================================

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl border border-[#4A7C8E]/40 text-[#4A7C8E]
                      flex items-center justify-center text-2xl mb-6">
        ◌
      </div>
      <h2 className="font-display text-2xl font-bold text-black mb-3">
        No Data Available
      </h2>
      <p className="font-arial text-xs text-black/40 max-w-sm leading-relaxed">
        There are no approved quota requests in the system yet. Data will appear
        here once companies submit and receive approved requests.
      </p>
    </div>
  );
}