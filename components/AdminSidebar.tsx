'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/authService';

const navItems = [
  { href: '/admin/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { href: '/admin/technicians', icon: 'verified_user', label: 'User Verification' },
  { href: '/admin/bookings', icon: 'event_note', label: 'Bookings' },
  { href: '/admin/analytics', icon: 'monitoring', label: 'Analytics' },
  { href: '/admin/audit-log', icon: 'description', label: 'Audit Logs' },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/auth/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">
          <span className="material-symbols-outlined" style={{ color: '#2ecc71', fontSize: '24px' }}>eco</span>
        </div>
        <div className="logo-text">
          <h1>Ministry of Environment</h1>
          <span>Admin Portal</span>
        </div>
        {/* Mobile Close Button */}
        {isOpen && (
          <button 
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <div className="nav-label">Administration</div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="user-info">
            <h4>Admin</h4>
            <span>System Administrator</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
