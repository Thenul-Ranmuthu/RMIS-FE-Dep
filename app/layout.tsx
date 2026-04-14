import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Ministry of Environment Portal",
    description: "Unified Access Portal for public users, technicians, and partner companies.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full w-full">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            </head>
            <body className="h-full w-full antialiased">
                {children}
            </body>
        </html>
    );
}