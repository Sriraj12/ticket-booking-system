"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import API from "@/lib/api";

const emptyTheater = {
    theater_name: "",
    city: "",
    state: "",
    location: "",
    status: "active",
};

const emptyScreen = {
    screen_name: "",
    seat_capacity: "",
    screen_type: "Standard",
    no_of_rows: "",
    seats_per_row: "",
    premium_rows: "",
    recliner_rows: "",
};

const emptyShow = {
    movie_title: "",
    screen_id: "",
    start_time: "",
    end_time: "",
    base_ticket_price: 150,
    premium_ticket_price: 180,
    recliner_ticket_price: 200
};

const STATUS_OPTIONS = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
];

const TheaterDetailPage = () => {
    const [theaters, setTheaters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [theaterForm, setTheaterForm] = useState(emptyTheater);
    const [screenForm, setScreenForm] = useState(emptyScreen);
    const [showForm, setShowForm] = useState(emptyShow);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchTheaters();
    }, []);

    const getTheaterId = (theater) => theater?.id ?? theater?._id;

    const fetchTheaters = async () => {
        try {
            const response = await API.get("admin/theaters");
            const data = response.data;
            setTheaters(data?.theaters || []);
        } catch (error) {
            console.error("Error fetching theaters:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getOwnerName = (theater) => {
        return theater?.owner?.name || theater?.owner_name || theater?.seller?.name || theater?.seller_name || theater?.registered_by || "Unknown";
    };

    const openModal = (modalType, theater = null) => {
        setErrorMessage("");
        setSelectedTheater(theater);
        if (modalType === "editTheater") {
            setTheaterForm({
                theater_name: theater?.theater_name || "",
                address: theater?.address || "",
                city: theater?.city || "",
                state: theater?.state || "",
                pincode: theater?.pincode || "",
                status: theater?.status || "active",
            });
        } else {
            setTheaterForm(emptyTheater);
        }

        if (modalType === "addScreen") {
            setScreenForm(emptyScreen);
        }

        if (modalType === "addShow") {
            setShowForm({
                ...emptyShow,
                screen_id:
                    theater?.screens?.[0]?.id ?? theater?.screens?.[0]?._id ?? "",
            });
        }

        setActiveModal(modalType);
    };


    const handleTheaterDetail = async (theaterId) => {
        try{
            const response = await API.get(`admin/theater/${theaterId}`);
            const data = response.data;
            const theater = data?.theater;
            if(theater){
                openModal("editTheater", theater);
            } else {
                setErrorMessage("Theater details not found.");
            }
        } catch(err){
            console.error(err);
        }
    }

    return (
        <AdminRoute>
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-black">Theaters</h1>
                        <p className="mt-2 text-slate-600">
                            Overview of all theaters registered for verification and management. Approve or reject seller-submitted theaters directly from the list.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-slate-600">Total Theaters</p>
                            <p className="mt-3 text-3xl font-semibold text-black">{theaters.length}</p>
                        </div>
                        <div className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">
                            {theaters.length} registered theaters
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="rounded-3xl border border-black/10 bg-black/5 p-4 text-sm text-slate-600">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-700 shadow-2xl backdrop-blur-sm">
                        Loading theaters...
                    </div>
                ) : theaters.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-700 shadow-2xl backdrop-blur-sm">
                        No theaters found for your account.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-black">Registered Theaters</h2>
                                    <p className="text-sm text-slate-600">Review seller-submitted theater registrations and update their status.</p>
                                </div>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-sm text-slate-700">
                                    {theaters.length} theaters
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-800 text-sm">
                                <thead className="bg-white/80 text-left text-black">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Theater</th>
                                        <th className="px-6 py-4 font-medium">Owner</th>
                                        <th className="px-6 py-4 font-medium">Location</th>
                                        <th className="px-6 py-4 text-right font-medium">Screens</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-white/80">
                                    {theaters.map((theater) => {
                                        const theaterId = getTheaterId(theater);
                                        const ownerName = getOwnerName(theater);
                                        const location = theater.location || theater.address || theater.formatted_address || `${theater.city || ""}${theater.state ? `, ${theater.state}` : ""}` || "Unknown";
                                        const screenCount = Array.isArray(theater.screens) ? theater.screens.length : theater.total_screens ?? theater.screen_count ?? 0;
                                        const currentStatus = theater.approval_status || "PENDING";
                                        const statusOptions = STATUS_OPTIONS.some((option) => option.value === currentStatus)
                                            ? STATUS_OPTIONS
                                            : [{ label: currentStatus, value: currentStatus }, ...STATUS_OPTIONS];

                                        return (
                                            <tr key={theaterId || theater.theater_name} className="border-b border-slate-300 last:border-0">
                                                <td className="px-6 py-4 align-top" onClick={() => handleTheaterDetail(theaterId)} >
                                                    <div className="font-semibold text-black">{theater.theater_name || "Untitled Theater"}</div>
                                                    <div className="mt-1 text-slate-500 text-xs">{theater.city || "Unknown city"}{theater.state ? `, ${theater.state}` : ""}</div>
                                                </td>
                                                <td className="px-6 py-4 align-top text-slate-700">{ownerName}</td>
                                                <td className="px-6 py-4 align-top text-slate-700 max-w-[240px] truncate">{location}</td>
                                                <td className="px-6 py-4 align-top text-right text-slate-700">{screenCount}</td>
                                                <td className="px-6 py-4 align-top">
                                                    <select
                                                        value={currentStatus}
                                                        onChange={(e) => handleStatusChange(theaterId, e.target.value)}
                                                        disabled={statusUpdatingId === theaterId}
                                                        className="w-full rounded-2xl border border-slate-300 bg-slate-100/90 px-3 py-2 text-sm text-black outline-none transition focus:border-black"
                                                    >
                                                        {STATUS_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminRoute>
    );
};

export default TheaterDetailPage;
