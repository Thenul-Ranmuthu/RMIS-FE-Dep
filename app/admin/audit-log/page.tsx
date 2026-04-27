'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/services/auditLogService';
import { AuditLog, AuditLogFilters } from '@/types/auditLog';
import AuditLogTable from '@/components/audit-log/AuditLogTable';
import AuditLogFiltersPanel from '@/components/audit-log/AuditLogFilters';

const getDefaultFilters = (): AuditLogFilters => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
};

export default function AuditLogPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>(getDefaultFilters());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getAuditLogs(filters);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
  };

  const approvedCount = data.filter(log => log.action_type === 'APPROVED').length;
  const rejectedCount = data.filter(log => log.action_type === 'REJECTED').length;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Audit Log</h2>
            <p>Track all officer approval and rejection actions on quota requests</p>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 300 }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="stat-pills-container">
        <div className="stat-pill total">
          <div className="icon-box">
            <span className="material-symbols-outlined">history</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Interactions</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{data.length}</div>
          </div>
          <b style={{ display: 'none' }}>{data.length}</b> {/* Kept for CSS hidden logic if any */}
        </div>

        <div className="stat-pill approved">
          <div className="icon-box">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved Actions</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{approvedCount}</div>
          </div>
        </div>

        <div className="stat-pill rejected">
          <div className="icon-box">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejected Actions</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      <div className="master-table-card">
        <div className="filters-section">
          <AuditLogFiltersPanel
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </div>

        <div className="table-section">
          <AuditLogTable data={data} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
