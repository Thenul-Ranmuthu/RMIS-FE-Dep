"use client";

import LoginCard from "../components/LoginCard";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
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

      {/* Main Content - Full height, no scroll */}
      <div className="relative h-full w-full flex items-center justify-between px-10 py-16 max-w-7xl mx-auto">
        {/* Left Side Text */}
        <div className="max-w-lg text-white flex-1">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
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

          <h1 className="text-5xl font-black leading-tight text-white drop-shadow-lg">
            Preserving our natural heritage for a{" "}
            <span className="text-emerald-300">sustainable tomorrow.</span>
          </h1>

          <p className="mt-6 text-base text-white/90 font-medium leading-relaxed drop-shadow">
            Unified Access Portal for public users, technicians, and partner
            companies. Together for a greener planet.
          </p>
        </div>

        {/* Login Card */}
        <div className="flex-shrink-0 ml-12">
          <LoginCard />
        </div>
      </div>

      {/* Bottom Footer - Fixed at bottom */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/80 font-medium flex items-center justify-center gap-6">
        <p>
          &copy; {new Date().getFullYear()} RMIS. All rights reserved.
        </p>
        <span className="text-white/40">·</span>
        <a href="#" className="hover:text-emerald-300 transition">
          Privacy Policy
        </a>
        <span className="text-white/40">·</span>
        <a href="#" className="hover:text-emerald-300 transition">
          Accessibility
        </a>
      </div>

      {/* Floating Profile Button */}
      <div className="absolute bottom-8 right-8 bg-emerald-600 hover:bg-emerald-700 transition text-white h-14 w-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
  );
}