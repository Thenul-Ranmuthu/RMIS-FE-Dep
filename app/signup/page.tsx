"use client";

import SignupCard from "../../components/SignupCard";

export default function SignupPage() {
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

            {/* Content - Centered */}
            <div className="relative h-full w-full flex items-center justify-center px-10 py-16 max-w-7xl mx-auto">
                <SignupCard />
            </div>
        </div>
    );
}