"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    Building2,
    Monitor,
    Clapperboard,
    Film,
    IndianRupee,
    LogOut,
    Ticket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
    {
        name: "Dashboard",
        href: "/seller/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Theaters",
        href: "/seller/theaters",
        icon: Building2,
    },
    {
        name: "Movies",
        href: "/seller/movies",
        icon: Clapperboard,
    },
    {
        name: "Shows",
        href: "/seller/shows",
        icon: Film,
    },
    {
        name: "Revenue",
        href: "/seller/revenue",
        icon: IndianRupee,
    },
];

const SellerSidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    }

    return (
        <aside className="w-72 min-h-screen border-r border-slate-800/70 bg-slate-950/95 text-slate-100 p-6">
            <div className="mb-10">
                <div className="flex">
                    <h1 className="text-3xl mr-2 font-extrabold tracking-tight bg-gradient-to-r from-white to-black bg-clip-text text-transparent">
                        BlackTicket 
                    </h1>
                    <Ticket className="text-slate-300" size={35} />
                </div>
                <p className="mt-2 text-sm text-slate-400">Manage theaters, shows, and revenue</p>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-slate-800 text-amber-300" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <button className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-slate-200 transition hover:bg-slate-700" onClick={handleLogout} >
                <LogOut size={20} />
                Logout
            </button>
        </aside>
    );
}
export default SellerSidebar;
