'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/authService';
import {
    LayoutDashboard,
    Files,
    BarChart2,
    LogOut,
    CheckCircle,
    RefreshCw,
} from "lucide-react";

interface MinistrySidebarProps {
    totalCount?: number;
}

export default function MinistrySidebar({ totalCount = 0 }: MinistrySidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/ministry/auth/login');
    };

    const navItems = [
        { href: '/ministry/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { href: '/ministry/quota-requests', icon: <Files size={18} />, label: 'Quota Requests' },
        { href: '/ministry/reports', icon: <BarChart2 size={18} />, label: 'Reports' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <RefreshCw size={22} color="#2ecc71" strokeWidth={2.5} />
                </div>
                <div className="logo-text">
                    <h1 style={{ color: 'white', fontSize: '15px' }}>Ministry of Environment</h1>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>ENVIRONMENTAL QUOTA DIVISION</span>
                </div>
            </div>

            <div className="nav-label">Main Menu</div>
            <ul className="nav-links">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </ul>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                    </div>
                    <div className="user-info">
                        <h4 style={{ color: 'white', marginBottom: '2px' }}>Ministry Officer</h4>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Recs: {totalCount}</span>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <CheckCircle size={16} color="#2ecc71" />
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
