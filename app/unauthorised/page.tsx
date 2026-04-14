// RMIS-FE/app/unauthorised/page.tsx
'use client';
import Link from 'next/link';

export default function UnauthorisedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-slate-500 max-w-md">
                You do not have permission to view this page.
                Please sign in with an authorised ministry account.
            </p>
            <Link
                href="/ministry"
                className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
            >
                Back to Login
            </Link>
        </div>
    );
}