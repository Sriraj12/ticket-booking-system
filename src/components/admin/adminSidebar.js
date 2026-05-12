"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Film, Building2, IndianRupee } from "lucide-react";

const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Movies", href: "/admin/movies", icon: Film },
    { name: "Revenue", href: "/admin/revenue", icon: IndianRupee },
    { name: "Theaters", href: "/admin/theaters", icon: Building2 },
];

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-72 min-h-screen border-r border-slate-800/70 bg-slate-950/95 text-slate-100 p-6">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <p className="mt-2 text-sm text-slate-400">Manage movies, theaters, and reports</p>
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
        </aside>
    );
};

export default AdminSidebar;
