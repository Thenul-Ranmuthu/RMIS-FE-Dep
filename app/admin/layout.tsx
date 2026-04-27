'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, getRole } from '@/services/authService';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthRoute = pathname?.startsWith('/admin/auth');

  useEffect(() => {
    if (isAuthRoute) return;

    const token = getToken();
    const role = getRole();

    if (!token) {
      router.push('/admin/auth/login');
      return;
    }

    if (role !== 'ADMIN') {
      router.push('/unauthorised');
      return;
    }

    setAuthorized(true);
  }, [isAuthRoute, router]);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="admin-theme">
      {/* Mobile nav header */}
      <div className="mobile-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
            <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>eco</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#0d2b1f' }}>Admin Portal</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <div className="app-container">
        {/* Sidebar Overlay (Mobile) */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
