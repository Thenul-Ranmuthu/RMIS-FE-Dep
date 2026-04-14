// RMIS-FE/components/audit-log/AuditLogTable.tsx

import { AuditLog, AuditActionType } from '@/types/auditLog';

interface AuditLogTableProps {
    data: AuditLog[];
    isLoading: boolean;
}

const ActionBadge = ({ type }: { type: AuditActionType }) => {
    const styles = {
        APPROVED: {
            backgroundColor: '#dcfce7',
            color: '#166534',
            dot: '#22c55e',
            label: 'Approved',
        },
        REJECTED: {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            dot: '#ef4444',
            label: 'Rejected',
        },
    };

    const s = styles[type];
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: s.backgroundColor,
            color: s.color,
        }}>
            <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: s.dot,
                flexShrink: 0,
            }} />
            {s.label}
        </span>
    );
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const SkeletonRow = () => (
    <tr>
        {Array.from({ length: 6 }).map((_, i) => (
            <td key={i} style={{ padding: '16px 24px' }}>
                <div style={{
                    height: 14,
                    borderRadius: 6,
                    backgroundColor: '#e2e8f0',
                    width: '75%',
                    animation: 'pulse 1.5s infinite',
                }} />
            </td>
        ))}
    </tr>
);

export default function AuditLogTable({ data, isLoading }: AuditLogTableProps) {
    const columns = ['Request ID', 'Officer Name', 'Officer Email', 'Action', 'Rejection Reason', 'Timestamp'];

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {columns.map((col) => (
                            <th key={col} style={{
                                padding: '12px 24px',
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Loading */}
                    {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                    {/* Empty */}
                    {!isLoading && data.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ padding: '64px 24px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 48 }}>📋</span>
                                    <p style={{ fontWeight: 600, color: '#475569', margin: 0 }}>
                                        No audit logs found
                                    </p>
                                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                                        Try adjusting the date range filter.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {/* Data rows */}
                    {!isLoading && data.map((log) => (
                        <tr
                            key={log.id}
                            style={{ borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                                #{log.request_id}
                            </td>
                            <td style={{ padding: '14px 24px', fontSize: 14, color: '#475569' }}>
                                {log.officer_name}
                            </td>
                            <td style={{ padding: '14px 24px', fontSize: 14, color: '#475569' }}>
                                {log.officer_email}
                            </td>
                            <td style={{ padding: '14px 24px' }}>
                                <ActionBadge type={log.action_type} />
                            </td>
                            <td style={{ padding: '14px 24px', fontSize: 13, color: '#64748b', maxWidth: 240 }}>
                                {log.rejection_reason ?? (
                                    <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>—</span>
                                )}
                            </td>
                            <td style={{ padding: '14px 24px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                                {formatDate(log.timestamp)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}