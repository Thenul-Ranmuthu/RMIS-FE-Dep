// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// interface LoginFormData {
//   email: string;
//   password: string;
// }

// interface LoginResponse {
//   accessToken: string;
//   tokenType: string;
//   role: string;
//   email: string;
// }

// export default function LoginCard() {
//   const router = useRouter();
//   const [role, setRole] = useState<string>("Public User");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [rememberMe, setRememberMe] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [formData, setFormData] = useState<LoginFormData>({
//     email: "",
//     password: "",
//   });

//   const roles: string[] = ["Public User", "Technician", "Company"];

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     setError("");
//   };

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const getLoginEndpoint = (role: string): string => {
//     switch (role) {
//       case "Technician":
//         return "http://localhost:5055/auth/technician/login";
//       case "Company":
//         return "http://localhost:5055/auth/company/login";
//       case "Public User":
//         // Return a placeholder - you'll need to implement this endpoint
//         return "http://localhost:5055/auth/user/login";
//       default:
//         return "http://localhost:5055/auth/technician/login";
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validation
//     if (!validateEmail(formData.email)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       const endpoint = getLoginEndpoint(role);

//       console.log(`Attempting login for ${role} at:`, endpoint);

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Handle different error responses
//         const errorMessage =
//           data.error || data.message || `Login failed: ${response.status}`;
//         throw new Error(errorMessage);
//       }

//       // Successful login
//       console.log("Login successful:", data);

//       // Store the token
//       if (data.accessToken) {
//         if (rememberMe) {
//           localStorage.setItem("accessToken", data.accessToken);
//           localStorage.setItem(
//             "user",
//             JSON.stringify({
//               email: data.email,
//               role: role,
//             }),
//           );
//         } else {
//           // Use sessionStorage if not remember me
//           sessionStorage.setItem("accessToken", data.accessToken);
//           sessionStorage.setItem(
//             "user",
//             JSON.stringify({
//               email: data.email,
//               role: role,
//             }),
//           );
//         }
//       }

//       // Redirect based on role
//       // Use the selected tab role since backend doesn't return role in response
//       if (role === "Company") {
//         router.push("/company/dashboard");
//       } else if (role === "Technician") {
//         router.push("/technician/dashboard");
//       } else if (role === "Public User") {
//         router.push("/dashboard");
//       } else {
//         router.push("/dashboard");
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Login failed. Please check your credentials.",
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Get appropriate placeholder text based on role
//   const getEmailPlaceholder = () => {
//     switch (role) {
//       case "Technician":
//         return "technician@example.com";
//       case "Company":
//         return "contact@company.com";
//       default:
//         return "user@example.com";
//     }
//   };

//   return (
//     <div className="bg-white rounded-3xl shadow-2xl w-[460px] p-10">
//       <h2 className="text-3xl font-black text-gray-900 leading-tight">
//         Sign In to Your Account
//       </h2>
//       <p className="text-gray-500 mt-2 mb-7 text-sm">
//         Please select your role and enter your credentials.
//       </p>

//       {/* Role Tabs */}
//       <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
//         {roles.map((item) => (
//           <button
//             key={item}
//             type="button"
//             onClick={() => {
//               setRole(item);
//               setError(""); // Clear error when switching roles
//             }}
//             className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
//               role === item
//                 ? "bg-white shadow text-gray-900"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {item}
//           </button>
//         ))}
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         {/* Email Field */}
//         <div className="mb-4">
//           <label className="block text-sm font-semibold text-gray-700 mb-1.5">
//             {role === "Technician"
//               ? "Email"
//               : role === "Company"
//                 ? "Business Email"
//                 : "Email"}
//           </label>
//           <div className="relative">
//             <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
//                 />
//               </svg>
//             </span>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               placeholder={getEmailPlaceholder()}
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
//               required
//               disabled={isLoading}
//             />
//           </div>
//         </div>

//         {/* Password Field */}
//         {/* <div className="flex items-center justify-between mb-1.5">
//             <label className="block text-sm font-semibold text-gray-700">
//               Password
//             </label>
//             <a
//               href="#"
//               className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition"
//               onClick={(e) => {
//                 e.preventDefault();
//                 // Handle forgot password
//                 alert("Please contact support to reset your password");
//               }}
//             >
//               Forgot Password?
//             </a>
//           </div> */}
//         <div className="mb-5">
//           <div className="flex items-center justify-between mb-1.5">
//             <label className="block text-sm font-semibold text-gray-700">
//               Password
//             </label>
//             <Link
//               href="/forgot-password"
//               className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition"
//             >
//               Forgot Password?
//             </Link>
//           </div>
//           <div className="relative">
//             <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                 />
//               </svg>
//             </span>
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               placeholder="••••••••"
//               className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
//               required
//               disabled={isLoading}
//               minLength={6}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
//               disabled={isLoading}
//             >
//               {showPassword ? (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-4 w-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                   />
//                 </svg>
//               ) : (
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-4 w-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                   />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Remember Me */}
//         <div className="flex items-center gap-2.5 mb-6">
//           <button
//             type="button"
//             onClick={() => !isLoading && setRememberMe(!rememberMe)}
//             className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
//               rememberMe
//                 ? "bg-emerald-600 border-emerald-600"
//                 : "border-gray-300 bg-white"
//             } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
//             style={{ height: "18px", width: "18px" }}
//             disabled={isLoading}
//           >
//             {rememberMe && (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-3 w-3 text-white"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={3}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             )}
//           </button>
//           <span
//             className={`text-sm text-gray-600 cursor-pointer select-none ${isLoading ? "opacity-50" : ""}`}
//             onClick={() => !isLoading && setRememberMe(!rememberMe)}
//           >
//             Remember me for 30 days
//           </span>
//         </div>

//         {/* Sign In Button */}
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading ? (
//             <>
//               <svg
//                 className="animate-spin h-4 w-4 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Signing In...
//             </>
//           ) : (
//             <>
//               Sign In
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//                 />
//               </svg>
//             </>
//           )}
//         </button>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           Don&apos;t have an account?{" "}
//           <Link
//             href="/signup"
//             className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
//           >
//             Create an Account →
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  role: string;
  email: string;
}

export default function LoginCard() {
  const router = useRouter();
  const [role, setRole] = useState<string>("Public User");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const roles: string[] = ["Public User", "Technician", "Company"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setError("");
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getLoginEndpoint = (role: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5055";
    switch (role) {
      case "Technician":
        return "http://localhost:5050/auth/technician/login";
      case "Company":
        return "http://localhost:5050/auth/company/login";
      case "Public User":
        // Return a placeholder - you'll need to implement this endpoint
        return "http://localhost:5050/auth/user/login";
      default:
        return "http://localhost:5050/auth/technician/login";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      const endpoint = getLoginEndpoint(role);

      console.log(`Attempting login for ${role} at:`, endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error responses
        const errorMessage =
          data.error || data.message || `Login failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Successful login
      console.log("Login successful:", data);

      // Store the token
      if (data.accessToken) {
        if (rememberMe) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: data.email ?? formData.email,
              role: role,
              status: data.status,
            }),
          );
        } else {
          // Use sessionStorage if not remember me
          sessionStorage.setItem("accessToken", data.accessToken);
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              email: data.email ?? formData.email,
              role: role,
              status: data.status,
            }),
          );
        }
      }

      // Redirect based on role
      // Use the selected tab role since backend doesn't return role in response
      if (role === "Company") {
        router.push("/company/dashboard");
      } else if (role === "Technician") {
        router.push("/technician/dashboard");
      } else if (role === "Public User") {
        router.push("/public-user");
      } else {
        router.push("/public-user");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate placeholder text based on role
  const getEmailPlaceholder = () => {
    switch (role) {
      case "Technician":
        return "technician@example.com";
      case "Company":
        return "contact@company.com";
      default:
        return "user@example.com";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-6 sm:p-10">
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
        Sign In to Your Account
      </h2>
      <p className="text-gray-500 mt-2 mb-5 sm:mb-7 text-sm">
        Please select your role and enter your credentials.
      </p>

      {/* Role Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
        {roles.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setRole(item);
              setError(""); // Clear error when switching roles
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              role === item
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {role === "Technician"
              ? "Email"
              : role === "Company"
                ? "Business Email"
                : "Email"}
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
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={getEmailPlaceholder()}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition placeholder-gray-400"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition"
            >
              Forgot Password?
            </Link>
          </div>
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
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
            className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              rememberMe
                ? "bg-emerald-600 border-emerald-600"
                : "border-gray-300 bg-white"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ height: "18px", width: "18px" }}
            disabled={isLoading}
          >
            {rememberMe && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
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

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-emerald-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              Signing In...
            </>
          ) : (
            <>
              Sign In
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
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
          >
            Create an Account →
          </Link>
        </p>
      </form>
    </div>
  );
}
