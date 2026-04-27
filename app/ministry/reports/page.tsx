"use client";

import { Suspense } from "react";
import DashboardClient from "@/components/analytics/DashboardClient";
import MinistrySidebar from "@/components/MinistrySidebar";

function ReportsContent() {
    return (
        <div className="admin-theme" style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundImage: "url('/ministry_dashboard_bg_deer_1776617937111.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <MinistrySidebar />

            {/* ── Main Content ──────────────────────────────────────────── */}
            <main className="main-content" style={{ 
                background: 'rgba(255, 255, 255, 0.45)', 
                backdropFilter: 'blur(40px)',
                flex: 1,
                margin: '20px',
                borderRadius: '32px',
                padding: '32px 40px'
            }}>
                <DashboardClient initialData={null} />

                <footer className="app-footer" style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>&copy; 2024 Ministry of Environment</span>
                    <a href="#" style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 600 }}>Help Center</a>
                </footer>
            </main>
        </div>
    );
}

export default function MinistryReportsPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading reports...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
