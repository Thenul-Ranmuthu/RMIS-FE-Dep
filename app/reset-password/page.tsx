"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

type TokenStatus = "validating" | "valid" | "invalid";
type SubmitStatus = "idle" | "loading" | "success" | "error";

// Password strength checker
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@#$%^&+=!]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-400" };
  if (score === 3) return { score, label: "Fair", color: "bg-yellow-400" };
  if (score === 4) return { score, label: "Good", color: "bg-emerald-400" };
  return { score, label: "Strong", color: "bg-emerald-600" };
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const strength = getPasswordStrength(newPassword);

  // Requirements list
  const requirements = [
    { test: newPassword.length >= 8, label: "At least 8 characters" },
    { test: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
    { test: /[a-z]/.test(newPassword), label: "One lowercase letter" },
    { test: /[0-9]/.test(newPassword), label: "One number" },
    {
      test: /[@#$%^&+=!]/.test(newPassword),
      label: "One special character (@#$%^&+=!)",
    },
  ];

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/password-reset/validate?token=${encodeURIComponent(token)}`,
        );
        const data = await res.json().catch(() => ({}));
        setTokenStatus(data.valid === true ? "valid" : "invalid");
      } catch {
        setTokenStatus("invalid");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (requirements.some((r) => !r.test)) {
      setErrorMsg("Please meet all password requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitStatus("loading");

    try {
      const res = await fetch(`${API_BASE_URL}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Password reset failed.");
      }

      setSubmitStatus("success");
      // Auto-redirect after 3s
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  // ── Validating token ──
  if (tokenStatus === "validating") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <svg
          className="animate-spin h-10 w-10 text-emerald-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-500 text-sm font-medium">
          Validating your reset link…
        </p>
      </div>
    );
  }

  // ── Invalid / expired token ──
  if (tokenStatus === "invalid") {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Link expired or invalid
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          This password reset link has expired or is invalid. Reset links are
          only valid for{" "}
          <span className="font-semibold text-gray-700">24 hours</span>. Please
          request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-bold text-center shadow-lg shadow-emerald-200 transition-all duration-200 mb-4"
        >
          Request New Link
        </Link>
        <p className="text-sm text-gray-400">
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium transition"
          >
            ← Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  // ── Success state ──
  if (submitStatus === "success") {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-100 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Password updated!
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your password has been reset successfully. You can now sign in with
          your new password.
        </p>
        <div className="flex items-center gap-2 justify-center text-xs text-gray-400 mb-6">
          <svg
            className="animate-spin h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Redirecting to sign in…
        </div>
        <Link
          href="/login"
          className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-sm font-bold text-center shadow-lg shadow-emerald-200 transition-all duration-200"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  // ── Password reset form ──
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="bg-emerald-100 rounded-full p-4 shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
        Create new password
      </h1>
      <p className="text-gray-500 text-sm text-center mb-7">
        Your new password must be different from any previous passwords.
      </p>

      {/* Error banner */}
      {submitStatus === "error" && errorMsg && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* New Password */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (submitStatus === "error") {
                  setSubmitStatus("idle");
                  setErrorMsg("");
                }
              }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              disabled={submitStatus === "loading"}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
            >
              {showPassword ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Password strength bar */}
        {newPassword && (
          <div className="mb-4">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-xs font-medium ${
                strength.score <= 2
                  ? "text-red-500"
                  : strength.score === 3
                    ? "text-yellow-600"
                    : "text-emerald-600"
              }`}
            >
              {strength.label}
            </p>
          </div>
        )}

        {/* Requirements checklist */}
        {newPassword && (
          <div className="mb-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Password requirements:
            </p>
            <ul className="space-y-1">
              {requirements.map((r) => (
                <li key={r.label} className="flex items-center gap-2">
                  <span
                    className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                      r.test ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  >
                    {r.test && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-xs ${r.test ? "text-emerald-700 font-medium" : "text-gray-500"}`}
                  >
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (submitStatus === "error") {
                  setSubmitStatus("idle");
                  setErrorMsg("");
                }
              }}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-gray-50 pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400 ${
                confirmPassword && newPassword !== confirmPassword
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              required
              disabled={submitStatus === "loading"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
            >
              {showConfirm ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              ✓ Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            submitStatus === "loading" ||
            requirements.some((r) => !r.test) ||
            newPassword !== confirmPassword
          }
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitStatus === "loading" ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Updating Password…
            </>
          ) : (
            <>
              Reset Password
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-5">
          <Link
            href="/login"
            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
          >
            ← Back to Sign In
          </Link>
        </p>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-10">
        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <svg
                className="animate-spin h-8 w-8 text-emerald-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
