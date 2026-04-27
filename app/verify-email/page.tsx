"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pendingCertifications } from "../../components/SignupCard";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [resendMessage, setResendMessage] = useState<string>("");

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingRegistration");
    if (!pending) {
      router.push("/signup");
      return;
    }
    const parsed = JSON.parse(pending);
    setEmail(parsed.email);
    setRole(parsed.role);
  }, []);

  const getEndpoint = (role: string, code: string): string => {
    switch (role) {
      case "Technician":
        return `https://www.rmis.space/api/auth/technician/register/${code}`;
      case "Company":
        return `https://www.rmis.space/api/auth/company/register/${code}`;
      case "Public User":
      default:
        return `https://www.rmis.space/api/auth/user/register/${code}`;
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const pending = sessionStorage.getItem("pendingRegistration");
      if (!pending) {
        router.push("/signup");
        return;
      }

      const userData = JSON.parse(pending);
      const storedRole = userData.role;
      const endpoint = getEndpoint(storedRole, code);

      let response: Response;

      if (storedRole === "Technician") {
        const formDataObj = new FormData();
        formDataObj.append("firstName", userData.firstName);
        formDataObj.append("lastName", userData.lastName);
        formDataObj.append("email", userData.email);
        formDataObj.append("phoneNumber", userData.phoneNumber);
        formDataObj.append("password", userData.password);
        formDataObj.append("address", userData.address || "");
        formDataObj.append("district", userData.district || "");
        formDataObj.append("specialization", userData.specialization || "");
        if (userData.yearsOfExperience != null) {
          formDataObj.append(
            "yearsOfExperience",
            userData.yearsOfExperience.toString(),
          );
        }

        // SAFETY CHECK: If files were lost from memory (due to refresh), show a clear error
        if (pendingCertifications.length === 0) {
          setError(
            "Your certification files were lost. Please go back and re-upload them.",
          );
          setIsLoading(false);
          return;
        }

        pendingCertifications.forEach((cert: any, index: number) => {
          formDataObj.append(
            `certifications[${index}].certificationName`,
            cert.certificationName,
          );
          formDataObj.append(
            `certifications[${index}].issuingAuthority`,
            cert.issuingAuthority || "",
          );
          formDataObj.append(`certifications[${index}].file`, cert.file);
        });

        response = await fetch(endpoint, {
          method: "POST",
          body: formDataObj,
        });
      } else {
        const { role: _role, ...payload } = userData;
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Verification failed");
      }

      // ✅ FIX
      sessionStorage.removeItem("pendingRegistration");
      pendingCertifications.length = 0;

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email,
            role: storedRole,
            status: data.status,
          }),
        );
      }

      if (storedRole === "Company") {
        router.push("/company/dashboard");
      } else if (storedRole === "Technician") {
        alert(
          "Registration successful! Your account is pending admin approval.",
        );
        router.push("/login");
      } else {
        alert("Registration successful! Please log in.");
        router.push("/login");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      const response = await fetch(
        `https://www.rmis.space/api/sendMail/${email}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) throw new Error("Failed to resend");
      setResendMessage("A new code has been sent to your email.");
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] p-6 sm:p-10">
        {/* Icon */}
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
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 text-center mb-1">
          Check your email
        </h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          We sent a 6-digit verification code to
        </p>
        <p className="text-sm font-semibold text-emerald-600 text-center mb-2">
          {email}
        </p>
        {role && (
          <p className="text-xs text-gray-400 text-center mb-6">
            Registering as:{" "}
            <span className="font-semibold text-gray-600">{role}</span>
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm text-emerald-600">{resendMessage}</p>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Verification Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setError("");
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-300"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-emerald-100 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Verify & Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Didn&apos;t receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </p>

          <p className="text-center text-sm text-gray-500 mt-3">
            Wrong details?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
            >
              Go back
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
