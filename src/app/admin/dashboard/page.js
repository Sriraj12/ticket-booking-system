"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import API from "@/lib/api";

const formatCurrency = (value) => {
    if (typeof value === "number") {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
    }
    return value || "₹0";
};

const AdminDashboardPage = () => {
    const [metrics, setMetrics] = useState({
        totalTheaters: 0,
        activeShows: 0,
        totalRevenue: 0,
        totalBookings: 0,
        totalMovies: 0,
        totalSellers: 0,
        totalUsers: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardMetrics();
    }, []);

    const fetchDashboardMetrics = async () => {
        try {
            const response = await API.get("admin/dashboard");
            const data = response.data?.data;

            console.log("response", response)

            setMetrics({
                totalTheaters: data?.total_theaters,
                totalUsers: data?.total_users,
                totalBookings: data?.total_bookings,
                totalRevenue: data?.total_revenue,
                totalMovies: data?.total_movies,
                totalSellers: data?.total_sellers
            })
        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        { label: "Total Theaters", value: metrics.totalTheaters },
        { label: "Total Bookings", value: metrics.totalBookings },
        { label: "Total Sellers", value: metrics.totalSellers },
        { label: "Total Users", value: metrics.totalUsers },
        { label: "Total Movies", value: metrics.totalMovies },
        // { label: "Total Revenue", value: formatCurrency(metrics.totalRevenue) },
    ];

    console.log("matrics", metrics);

    return (
        <AdminRoute>
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-black">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Quick overview of all theaters, screens, shows, and ticket share revenues.
                    </p>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-slate-700 shadow-2xl backdrop-blur-sm">
                        .
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((item) => (
                            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                                <h2 className="text-slate-600">{item.label}</h2>
                                <p className="mt-4 text-3xl font-semibold text-black">{item.value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminRoute>
    );
};
export default AdminDashboardPage;
