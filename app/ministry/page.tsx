// RMIS-FE/app/ministry/page.tsx

import Link from "next/link";

export default function MinistryPortalPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">

            {/* Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-50 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center">
                    Ministry of Environment
                </h1>
                <p className="text-gray-500 mt-2 text-sm text-center max-w-md">
                    Environmental Quota Division — Staff and Administration Portal
                </p>
            </div>

            {/* Cards */}
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">

                {/* Ministry Officer Card */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 border border-gray-100">
                    <div>
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Ministry Officer</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Review, approve, or reject industrial environmental quota applications.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <Link
                            href="/ministry/auth/login"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In as Officer
                        </Link>
                        <Link
                            href="/ministry/auth/register"
                            className="w-full border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98] text-emerald-700 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Register as Officer
                        </Link>
                    </div>
                </div>

                {/* Admin Card */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 border border-gray-100">
                    <div>
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-slate-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Administrator</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            System administration and full platform management access.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <Link
                            href="/admin/auth/login"
                            className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In as Admin
                        </Link>
                        <div className="w-full border-2 border-gray-100 text-gray-300 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Registration Restricted
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to main */}
            <p className="text-sm text-gray-400 mt-8">
                Not ministry staff?{" "}
                <Link href="/" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                    Go to main login →
                </Link>
            </p>
        </div>
    );
}