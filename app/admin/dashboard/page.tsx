'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuditLogs } from '@/services/auditLogService';
import { AuditLog } from '@/types/auditLog';

export default function AdminDashboardPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getAuditLogs({ from: '', to: '' });
        setAuditLogs(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const approvedCount = auditLogs.filter(l => l.action_type === 'APPROVED').length;
  const rejectedCount = auditLogs.filter(l => l.action_type === 'REJECTED').length;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Operations Overview</h2>
            <p>A high-level summary of system activity, user verification, and audit trends.</p>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 300 }}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="summary-cards-container">
        {/* System Health / Summary Cards */}
        <div className="summary-card highlight">
          <div className="summary-icon green">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div className="summary-info">
            <h3>Verified Users</h3>
            <div className="summary-value">
              {isLoading ? '—' : approvedCount}
              <span>approved</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon yellow" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div className="summary-info">
            <h3>Pending Tasks</h3>
            <div className="summary-value">
              12
              <span>requests</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div className="summary-info">
            <h3>Daily Bookings</h3>
            <div className="summary-value">
              8
              <span>scheduled</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <span className="material-symbols-outlined">report</span>
          </div>
          <div className="summary-info">
            <h3>Rejections</h3>
            <div className="summary-value">
              {isLoading ? '—' : rejectedCount}
              <span>actions</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Main Activity Table */}
        <div className="master-table-card" style={{ margin: 0 }}>
          <div className="filters-section">
            <div className="filters-header">
              <span className="material-symbols-outlined">history</span>
              Recent Administrative Actions
            </div>
          </div>
          <div className="table-section">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Action</th>
                  <th>ID</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Syncing activity...</td></tr>
                ) : auditLogs.slice(0, 7).map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '13px' }}>{log.officer_email}</td>
                    <td>
                      <span className={`status-badge ${log.action_type === 'APPROVED' ? 'status-approved' : 'status-rejected'}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="req-id">{log.request_id}</td>
                    <td style={{ fontSize: '12px', opacity: 0.7 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              <Link href="/admin/audit-log" className="action-link">View Detailed Audit History →</Link>
            </div>
          </div>
        </div>

        {/* System Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="master-table-card" style={{ margin: 0, padding: '24px' }}>
            <h4 style={{ marginBottom: '16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', color: '#1a4a38' }}>Quick Shortcuts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/admin/technicians" className="page-btn" style={{ justifyContent: 'start', textDecoration: 'none' }}>
                <span className="material-symbols-outlined">add_moderator</span> Verify New Users
              </Link>
              <Link href="/admin/analytics" className="page-btn" style={{ justifyContent: 'start', textDecoration: 'none' }}>
                <span className="material-symbols-outlined">leaderboard</span> View Quota Trends
              </Link>
              <Link href="/admin/bookings" className="page-btn" style={{ justifyContent: 'start', textDecoration: 'none' }}>
                <span className="material-symbols-outlined">calendar_today</span> Manage Appointments
              </Link>
            </div>
          </div>

          <div className="master-table-card" style={{ margin: 0, padding: '24px', background: 'linear-gradient(135deg, #1a4a38 0%, #0d2b1f 100%)', color: 'white', border: 'none' }}>
             <h4 style={{ marginBottom: '8px', fontWeight: 800, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>SYSTEM STATUS</h4>
             <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>OPERATIONAL</div>
             <p style={{ fontSize: '11px', opacity: 0.7 }}>All services are running normally. Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </>
  );
}
