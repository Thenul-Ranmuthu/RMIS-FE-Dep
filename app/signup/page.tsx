"use client";

import SignupCard from "../../components/SignupCard";

export default function SignupPage() {
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

            {/* Content - Centered */}
            <div className="relative min-h-screen w-full flex items-center justify-center px-4 sm:px-8 py-10">
                <SignupCard />
            </div>
        </div>
    );
}
