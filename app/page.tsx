"use client";

import LoginCard from "../components/LoginCard";

export default function Home() {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-8 lg:px-10 py-12 lg:py-16 max-w-7xl mx-auto gap-10">
        {/* Left Side Text */}
        <div className="max-w-lg text-white text-center lg:text-left flex-1">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center lg:justify-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-wide text-white drop-shadow-lg">
              Ministry of Environment
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-lg">
            Preserving our natural heritage for a{" "}
            <span className="text-emerald-300">sustainable tomorrow.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/90 font-medium leading-relaxed drop-shadow">
            Unified Access Portal for public users, technicians, and partner
            companies. Together for a greener planet.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[460px] flex-shrink-0 lg:ml-12">
          <LoginCard />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs sm:text-sm text-white/80 font-medium flex flex-wrap items-center justify-center gap-3 px-4">
        <p>
          &copy; {new Date().getFullYear()} RMIS. All rights reserved.
        </p>
        <span className="text-white/40 hidden sm:inline">·</span>
        <a href="#" className="hover:text-emerald-300 transition">
          Privacy Policy
        </a>
        <span className="text-white/40 hidden sm:inline">·</span>
        <a href="#" className="hover:text-emerald-300 transition">
          Accessibility
        </a>
      </div>
    </div>
  );
}
