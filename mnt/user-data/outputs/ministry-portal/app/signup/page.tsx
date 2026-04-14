"use client";

import SignupCard from "@/components/SignupCard";

export default function SignupPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/forest-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10">
        <SignupCard />
      </div>
    </main>
  );
}
