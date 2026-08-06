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
    title: "BlackTicket - Movie Ticket Booking",
    description: "Book your movie tickets online | Seamless cinema experience",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
        >
            <body className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-100 to-white text-black">
                <Provider>
                    {children}
                </Provider>
            </body>
        </html>
    );
}
