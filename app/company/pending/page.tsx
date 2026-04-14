"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyPendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("PENDING");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      // If somehow the company is now ACTIVE, redirect to dashboard
      if (parsed.status?.toUpperCase() === "ACTIVE") {
        router.push("/company/dashboard");
        return;
      }
      setStatus(parsed.status ?? "PENDING");
      setEmail(parsed.email ?? "");
    } catch {
      router.push("/");
    }
  }, [router]);

  const handleSignOut = () => {
    ["accessToken", "user"].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    router.push("/");
  };

  const isPending = status.toUpperCase() === "PENDING";

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`rounded-full p-5 ${
              isPending ? "bg-amber-100" : "bg-red-100"
            }`}
          >
            {isPending ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Status pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${
            isPending
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isPending ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          {status}
        </span>

        {/* Heading */}
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isPending
            ? "Your account is awaiting approval"
            : "Your account has been deactivated"}
        </h1>

        {/* Email */}
        {email && (
          <p className="text-sm font-semibold text-gray-400 mb-4">{email}</p>
        )}

        {/* Body text */}
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          {isPending
            ? "Thank you for registering. Our administrators will review your company account and set your yearly quota limit. You will gain access to the portal once your account is marked as Active."
            : "Your company account is currently inactive. Please contact the system administrator to re-activate your account and regain access to the portal."}
        </p>

        {/* Info box */}
        <div
          className={`flex items-start gap-3 p-4 rounded-xl text-left mb-8 ${
            isPending
              ? "bg-amber-50 border border-amber-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
              isPending ? "text-amber-500" : "text-red-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p
            className={`text-xs leading-relaxed ${
              isPending ? "text-amber-800" : "text-red-700"
            }`}
          >
            {isPending
              ? "Once approved, you can log in again to access the Company Portal and start managing your quota requests."
              : "If you believe this is an error, please reach out to your administrator with your registered email address."}
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </main>
  );
}
