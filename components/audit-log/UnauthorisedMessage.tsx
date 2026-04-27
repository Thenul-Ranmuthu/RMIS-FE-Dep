// RMIS-FE/components/audit-log/UnauthorisedMessage.tsx

import Link from 'next/link';

export default function UnauthorisedMessage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                }}
            >
                🔒
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
                Access Denied
            </h2>
            <p style={{ color: '#64748b', maxWidth: 400 }}>
                You do not have permission to view audit logs.
                This page is restricted to system administrators only.
            </p>
            <Link
                href="/admin/auth/login"
                style={{
                    marginTop: 8,
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    fontWeight: 700,
                    padding: '10px 24px',
                    borderRadius: 12,
                    textDecoration: 'none',
                }}
            >
                Back to Admin Login
            </Link>
        </div>
    );
}
