"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Homepage() {
  const [scrolled, setScrolled] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://www.rmis.space/api";
        const response = await fetch(`${baseUrl}/public/announcements`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-[#1f2937] font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#1a4a38] flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
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
            <span
              className={`text-xl font-bold tracking-tight ${scrolled ? "text-[#1a4a38]" : "text-white drop-shadow-md"}`}
            >
              RMIS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors ${scrolled ? "text-[#1a4a38] hover:text-emerald-600" : "text-white hover:text-emerald-200"}`}
            >
              Home
            </Link>
            <Link
              href="/public/directory"
              className={`text-sm font-semibold transition-colors ${scrolled ? "text-[#1a4a38] hover:text-emerald-600" : "text-white hover:text-emerald-200"}`}
            >
              Technician Search
            </Link>
            <Link
              href="#services"
              className={`text-sm font-semibold transition-colors ${scrolled ? "text-[#1a4a38] hover:text-emerald-600" : "text-white hover:text-emerald-200"}`}
            >
              Services
            </Link>
            <Link
              href="#announcements"
              className={`text-sm font-semibold transition-colors ${scrolled ? "text-[#1a4a38] hover:text-emerald-600" : "text-white hover:text-emerald-200"}`}
            >
              Announcements
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ${scrolled ? "text-[#1a4a38] border-2 border-[#1a4a38] hover:bg-[#1a4a38] hover:text-white" : "text-white border-2 border-white/30 bg-white/10 hover:bg-white/20"}`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a4a38]/90 to-[#1a4a38]/40 z-10" />
          <img
            src="/background.png"
            alt="Forest Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-emerald-300 uppercase bg-emerald-900/50 backdrop-blur-sm rounded-full border border-emerald-500/30">
              Official Ministry Portal
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-xl">
              Protecting Our{" "}
              <span className="text-emerald-400">Environment</span> Digitally.
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium mb-10 leading-relaxed max-w-xl drop-shadow">
              Welcome to the Resource Management Information System (RMIS). A
              unified digital platform for environmental quota management and
              certified technician services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/public/directory"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                Find a Technician
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#services"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border border-white/30 transition-all hover:-translate-y-1"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">
              Our Core Services
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-[#1a4a38] mb-6">
              Empowering Environmental Sustainability
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              RMIS provides critical digital infrastructure to streamline
              environmental compliance and resource management across the
              nation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quota Management */}
            <div className="group p-8 md:p-12 bg-[#f8faf9] rounded-[2.5rem] border border-gray-100 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-2">
              <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 transition-transform group-hover:rotate-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-[#1a4a38] mb-4">
                Quota Management
              </h4>
              <p className="text-gray-600 leading-relaxed mb-8">
                Efficient allocation and tracking of environmental quotas for
                partner companies. Ensure your business remains compliant with
                national standards through our transparent digital tracking
                system.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time usage tracking",
                  "Automated quota allocation",
                  "Compliance certification",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700"
                  >
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technician Services */}
            <div className="group p-8 md:p-12 bg-[#f8faf9] rounded-[2.5rem] border border-gray-100 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-2">
              <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 transition-transform group-hover:rotate-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-[#1a4a38] mb-4">
                Technician Services
              </h4>
              <p className="text-gray-600 leading-relaxed mb-8">
                Connect with certified environmental technicians specialized in
                sustainability and resource management. Our directory ensures
                you find qualified professionals for your specific needs.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Verified certifications",
                  "Direct booking portal",
                  "Performance ratings",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700"
                  >
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/public/directory"
                className="text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Search Technicians
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section
        id="announcements"
        className="py-24 bg-[#1a4a38] text-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">
                Stay Informed
              </h2>
              <h3 className="text-4xl md:text-5xl font-black mb-0 leading-tight">
                Latest Announcements
              </h3>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              // Loading Skeleton
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 h-64 animate-pulse"
                />
              ))
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/10 flex flex-col hover:bg-white/10 transition-all duration-300 group"
                >
                  <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-500/20">
                    {announcement.tag}
                  </span>
                  <h4 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">
                    {announcement.title}
                  </h4>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed flex-1 line-clamp-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <span className="text-xs font-bold text-white/70">
                      {new Date(announcement.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-white/40 font-medium">
                No announcements at this time.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#1a4a38] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
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
                <span className="text-2xl font-black text-[#1a4a38]">RMIS</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Official Resource Management Information System for the Ministry
                of Environment. Dedicated to sustainable development and digital
                resource tracking.
              </p>
            </div>

            <div>
              <h5 className="font-black text-[#1a4a38] mb-6">Platform</h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/directory"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Technician Directory
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Registration
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-[#1a4a38] mb-6">Services</h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Quota Requests
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Technician Booking
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Impact Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Policy Updates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-[#1a4a38] mb-6">Contact</h5>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500 leading-relaxed">
                    Ministry of Environment Headquarters, Colombo, Sri Lanka
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600"
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
                  <span className="text-sm text-gray-500">
                    info@environment.gov.lk
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Ministry of Environment. All
              rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-xs text-gray-400 hover:text-emerald-600 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-400 hover:text-emerald-600 font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-xs text-gray-400 hover:text-emerald-600 font-medium"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
