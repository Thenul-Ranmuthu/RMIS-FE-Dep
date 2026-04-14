// RMIS-FE/app/admin/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getRole } from '@/services/authService';
import { getAuditLogs } from '@/services/auditLogService';
import { AuditLog, AuditLogFilters } from '@/types/auditLog';
import AuditLogTable from '@/components/audit-log/AuditLogTable';
import AuditLogFiltersPanel from '@/components/audit-log/AuditLogFilters';
import UnauthorisedMessage from '@/components/audit-log/UnauthorisedMessage';
import Link from 'next/link';

// Default: last 30 days
const getDefaultFilters = (): AuditLogFilters => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
};

export default function AdminDashboardPage() {
    const router = useRouter();

    const [data, setData] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthorised, setIsUnauthorised] = useState(false);
    const [filters, setFilters] = useState<AuditLogFilters>(getDefaultFilters());

    // ── Auth guard ─────────────────────────────────────────────────────────
    useEffect(() => {
        const token = getToken();
        const role = getRole();

        if (!token) {
            router.push('/admin/auth/login');
            return;
        }

        if (role !== 'ADMIN') {
            setIsUnauthorised(true);
            return;
        }
    }, []);

    // ── Fetch audit logs ───────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await getAuditLogs(filters);
                setData(result);
            } catch (err: any) {
                if (err?.status === 401 || err?.status === 403) {
                    setIsUnauthorised(true);
                } else {
                    console.error(err);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [filters]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleFilterChange = (newFilters: AuditLogFilters) => {
        setFilters(newFilters);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        document.cookie = "accessToken=; path=/; max-age=0"; // ← clear cookie
        router.push('/ministry');
    };

    // ── Stats derived from data ────────────────────────────────────────────
    const approvedCount = data.filter(l => l.action_type === 'APPROVED').length;
    const rejectedCount = data.filter(l => l.action_type === 'REJECTED').length;

    // ── Render ─────────────────────────────────────────────────────────────
    if (isUnauthorised) return <UnauthorisedMessage />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside style={{
                width: 260,
                backgroundColor: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                height: '100vh',
            }}>
                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: 'rgba(34,197,94,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                        }}>
                            🛡️
                        </div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.2 }}>
                                Ministry of Environment
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0, fontWeight: 500 }}>
                                Admin Portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <p style={{
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '8px 8px 4px',
                        margin: 0,
                    }}>
                        Administration
                    </p>
                    {/* Active nav item */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        marginTop: 4,
                    }}>
                        <span>📋</span>
                        Audit Logs
                    </div>
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 8,
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)';
                            e.currentTarget.style.color = '#fca5a5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        }}
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────────────── */}
            <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

                {/* Page title */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                        Audit Log
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
                        Track all officer approval and rejection actions on quota requests.
                    </p>
                </div>

                {/* Stats cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 16,
                    marginBottom: 28,
                }}>
                    {/* Total records */}
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                        }}>
                            📋
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Total Actions
                            </p>
                            <p style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                {isLoading ? '—' : data.length}
                            </p>
                        </div>
                    </div>

                    {/* Approved */}
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: 12,
                        border: '1px solid #bbf7d0',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                        }}>
                            ✅
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Approved
                            </p>
                            <p style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                {isLoading ? '—' : approvedCount}
                            </p>
                        </div>
                    </div>

                    {/* Rejected */}
                    <div style={{
                        backgroundColor: '#fff1f2',
                        borderRadius: 12,
                        border: '1px solid #fecdd3',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                        }}>
                            ❌
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Rejected
                            </p>
                            <p style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                {isLoading ? '—' : rejectedCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <AuditLogFiltersPanel
                    onFilterChange={handleFilterChange}
                    isLoading={isLoading}
                />

                {/* Table */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    <AuditLogTable data={data} isLoading={isLoading} />
                </div>

                {/* Footer */}
                <footer style={{
                    marginTop: 40,
                    paddingTop: 20,
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
                        © 2024 Ministry of Environment. All Rights Reserved.
                    </p>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <Link href="#" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link href="#" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>Help Center</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}