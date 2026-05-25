import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/components/Providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "CineBook - Movie Ticket Booking",
    description: "Book your movie tickets online | Seamless cinema experience",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
        >
            <script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            />
            <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Provider>
                    {children}
                </Provider>
            </body>
        </html>
    );
}
