// RMIS-FE/types/auditLog.ts

export type AuditActionType = 'APPROVED' | 'REJECTED';

export interface AuditLog {
    id: number;
    officer_name: string;
    officer_email: string;
    action_type: AuditActionType;
    request_id: string;
    rejection_reason: string | null;
    timestamp: string;
}

export interface AuditLogFilters {
    from: string;  // ISO date e.g. 2026-03-01
    to: string;    // ISO date e.g. 2026-03-19
}
