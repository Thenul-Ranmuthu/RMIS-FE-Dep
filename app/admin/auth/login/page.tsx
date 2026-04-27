// RMIS-FE/app/admin/login/page.tsx 

import AdminLoginCard from "@/components/AdminLoginCard";

export default function AdminLoginPage() {
    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: 'url("/images/admin-bg.png")' }}
        >
            <AdminLoginCard />
        </div>
    );
}
