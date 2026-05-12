"use client";

import { useEffect, useState } from "react";
import SellerRoute from "@/components/SellerRoute";
import API from "@/lib/api";

const formatCurrency = (value) => {
    if (typeof value === "number") {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
    }
    return value || "₹0";
};

const SellerDashboardPage = () => {
    const [metrics, setMetrics] = useState({
        totalTheaters: 0,
        totalScreens: 0,
        activeShows: 0,
        totalRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardMetrics();
    }, []);

    const fetchDashboardMetrics = async () => {
        try {
            const response = await API.get("theater/theaters");
            const data = response.data;
            const theaters = data?.theaters || [];

            let totalScreens = 0;
            let activeShows = 0;
            let totalRevenue = 0;

            theaters.forEach((theater) => {
                if (Array.isArray(theater.screens)) {
                    totalScreens += theater.screens.length;
                } else if (typeof theater.total_screens === "number") {
                    totalScreens += theater.total_screens;
                } else if (typeof theater.screen_count === "number") {
                    totalScreens += theater.screen_count;
                }

                if (Array.isArray(theater.shows)) {
                    activeShows += theater.shows.length;
                } else if (typeof theater.active_shows === "number") {
                    activeShows += theater.active_shows;
                }

                if (typeof theater.revenue === "number") {
                    totalRevenue += theater.revenue;
                } else if (typeof theater.total_revenue === "number") {
                    totalRevenue += theater.total_revenue;
                }
            });

            if (typeof data.total_revenue === "number") {
                totalRevenue = data.total_revenue;
            }

            if (typeof data.active_shows === "number") {
                activeShows = data.active_shows;
            }

            if (typeof data.total_screens === "number") {
                totalScreens = data.total_screens;
            }

            setMetrics({
                totalTheaters: theaters.length,
                totalScreens: totalScreens || 0,
                activeShows: activeShows || 0,
                totalRevenue: totalRevenue || 0,
            });
        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { label: "Total Theaters", value: metrics.totalTheaters },
        { label: "Total Screens", value: metrics.totalScreens },
        { label: "Active Shows", value: metrics.activeShows },
        { label: "Revenue", value: formatCurrency(metrics.totalRevenue) },
    ];

    return (
        <SellerRoute>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Quick overview of your theaters, screens, shows, and revenue.
                    </p>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-8 text-center text-slate-300 shadow-2xl backdrop-blur-sm">
                        .
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((item) => (
                            <div key={item.label} className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
                                <h2 className="text-slate-400">{item.label}</h2>
                                <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SellerRoute>
    );
};
export default SellerDashboardPage;
