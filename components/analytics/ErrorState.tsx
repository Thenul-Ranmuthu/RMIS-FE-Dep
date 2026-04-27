// =============================================================
// components/analytics/ErrorState.tsx
// General fetch/server error — shown when backend call fails.
// onRetry is optional (not available on server-rendered error path).
// =============================================================

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl border border-[#C96E6E]/40 text-[#C96E6E]
                      flex items-center justify-center text-2xl mb-6">
        ✕
      </div>
      <h2 className="font-display text-2xl font-bold text-black mb-3">
        Failed to Load Dashboard
      </h2>
      <p className="font-arial text-xs text-black/40 max-w-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-black/[0.06] border border-black/12 rounded-lg
                     text-black/60 font-arial text-xs tracking-wide
                     hover:bg-black/10 transition-colors"
        >
          ↻ Retry
        </button>
      )}
    </div>
  );
}