// =============================================================
// components/analytics/AccessDeniedState.tsx
// Scenario 3: Rendered when a non-admin reaches the analytics page.
// Can be triggered by both server (page.tsx) and client (DashboardClient).
// =============================================================

export default function AccessDeniedState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl border border-black/15 text-black/25
                      flex items-center justify-center text-3xl mb-6">
        ⊘
      </div>
      <h2 className="font-display text-2xl font-bold text-black mb-3">
        Access Restricted
      </h2>
      <p className="font-arial text-xs text-black/40 max-w-sm leading-relaxed mb-2">
        This dashboard is only accessible to Ministry Administrators.
      </p>
      <p className="font-arial text-[10px] text-black/22">
        Contact your system administrator if you believe this is an error.
      </p>
    </div>
  );
}