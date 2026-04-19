"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveToken } from "@/services/authService";

interface LoginFormData {
    email: string;
    password: string;
}

export default function MinistryLoginCard() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const validateEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/ministry/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Login failed");
            }

            // Save token
            if (data.accessToken) {
                saveToken(data.accessToken);
                if (rememberMe) {
                    localStorage.setItem("accessToken", data.accessToken); 
                    
                } else {
                    sessionStorage.setItem("accessToken", data.accessToken);
                }
                // After saving to localStorage/sessionStorage, also set a cookie
                document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24}`;
            }

            router.push("/ministry/quota-requests");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-6 sm:p-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ministry of Environment</p>
                    <p className="text-xs text-gray-400">Environmental Quota Division</p>
                </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 leading-tight">
                Officer Sign In
            </h2>
            <p className="text-gray-500 mt-2 mb-7 text-sm">
                Sign in to manage and review environmental quota requests.
            </p>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Official Email
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="officer@environment.gov.lk"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <Link href="/forgot-password" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition">
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            disabled={isLoading}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5 mb-6">
                    <button
                        type="button"
                        onClick={() => !isLoading && setRememberMe(!rememberMe)}
                        className={`rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${rememberMe ? "bg-emerald-600 border-emerald-600" : "border-gray-300 bg-white"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ height: "18px", width: "18px" }}
                        disabled={isLoading}
                    >
                        {rememberMe && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                    <span
                        className={`text-sm text-gray-600 cursor-pointer select-none ${isLoading ? "opacity-50" : ""}`}
                        onClick={() => !isLoading && setRememberMe(!rememberMe)}
                    >
                        Remember me for 30 days
                    </span>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing In...
                        </>
                    ) : (
                        <>
                            Sign In to Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Need an account?{" "}
                    <Link href="/ministry/auth/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                        Register as Officer →
                    </Link>
                </p>

                <p className="text-center text-sm text-gray-500 mt-3">
                    Not a ministry officer?{" "}
                    <Link href="/" className="text-gray-400 font-medium hover:text-gray-600 transition">
                        Back to main login
                    </Link>
                </p>
            </form>
        </div>
    );
}