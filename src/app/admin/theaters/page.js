"use client";

import { useEffect, useState } from "react";
import AdminRoute from "@/components/AdminRoute";
import API from "@/lib/api";

const formatCurrency = (value) => {
    if (typeof value === "number") {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    }
    return value || "₹0";
};

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

const AdminTheatersPage = () => {
    const [theaters, setTheaters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [theaterForm, setTheaterForm] = useState(emptyTheater);
    const [screenForm, setScreenForm] = useState(emptyScreen);
    const [showForm, setShowForm] = useState(emptyShow);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [movies, setMovies] = useState([])
    const [showCustomizeTiming, setShowCustomizeTiming] = useState(false)
    const [showDate, setShowDate] = useState("")

    useEffect(() => {
        fetchTheaters();
    }, []);


    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await API.get("seller/all-movies");
            if (res.data.allMovies.length > 0) {
                const movies = res.data.allMovies.filter((movie) => movie.is_active)
                setMovies(movies);
            } else {
                setMovies([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleStatusChange = async (theaterId, newStatus) => {
        setErrorMessage("");
        setStatusUpdatingId(theaterId);

        try {
            await API.put(`admin/theater/approval`, { approval_status: newStatus, theater_id: theaterId });
            await fetchTheaters();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Unable to update theater status.");
        } finally {
            setStatusUpdatingId(null);
        }
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

    const closeModal = () => {
        setActiveModal(null);
        setSelectedTheater(null);
        setErrorMessage("");
    };

    const handleTheaterSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                theater_name: theaterForm.theater_name,
                location: theaterForm.location,
                city: theaterForm.city,
                state: theaterForm.state,
            };

            if (activeModal === "addTheater") {
                await API.post("theater/create-theater", payload);
            } else if (activeModal === "editTheater") {
                const theaterId = getTheaterId(selectedTheater);
                await API.put(`theater/theaters/${theaterId}`, payload);
            }

            await fetchTheaters();
            closeModal();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Unable to save theater.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScreenSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const theaterId = getTheaterId(selectedTheater);
            await API.post(`screen/create-screen`, {
                screen_name: screenForm.screen_name,
                total_seats: Number(screenForm.seat_capacity) || 0,
                theater_id: theaterId,
                rows: generateRowLabels(screenForm.no_of_rows),
                seats_per_row: screenForm.seats_per_row,
                recliner_rows: screenForm.recliner_rows.split(","),
                premium_rows: screenForm.premium_rows.split(",")
            });

            await fetchTheaters();
            closeModal();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Unable to add screen.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {

            const theaterId = getTheaterId(selectedTheater);
            // const show = {
            //     movie_id: showForm.movie_id,
            //     theater_id: theaterId,
            //     screen_id: showForm.screen_id,
            //     show_start_time: showForm.start_time,
            //     show_end_time: showForm.end_time,
            //     base_price: Number(showForm.base_ticket_price) || 0,
            //     premium_ticket_price: Number(showForm.premium_ticket_price) || 0,
            //     recliner_ticket_price: Number(showForm.recliner_ticket_price) || 0
            // }

            // console.log("show", show)
            await API.post(`show/create`, {
                movie_id: showForm.movie_id,
                theater_id: theaterId,
                screen_id: showForm.screen_id,
                show_start_time: showForm.start_time,
                show_end_time: showForm.end_time,
                base_price: Number(showForm.base_ticket_price) || 0,
                premium_ticket_price: Number(showForm.premium_ticket_price) || 0,
                recliner_ticket_price: Number(showForm.recliner_ticket_price) || 0
            });

            await fetchTheaters();
            closeModal();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Unable to add show.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalScreens = theaters.reduce((total, theater) => {
        if (Array.isArray(theater.screens)) return total + theater.screens.length;
        if (typeof theater.total_screens === "number") return total + theater.total_screens;
        if (typeof theater.screen_count === "number") return total + theater.screen_count;
        return total;
    }, 0);

    const activeShows = theaters.reduce((total, theater) => {
        if (Array.isArray(theater.shows)) return total + theater.shows.length;
        if (typeof theater.total_shows === "number") return total + theater.total_shows;
        return total;
    }, 0);

    const totalRevenue = theaters.reduce((total, theater) => {
        if (typeof theater.revenue === "number") return total + theater.revenue;
        if (typeof theater.total_revenue === "number") return total + theater.total_revenue;
        return total;
    }, 0);

    const generateRowLabels = (count) => {
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    };

    const DEFAULT_SHOW_TIMINGS = [
        {
            label: "Morning Show (11:30 AM)",
            start: "11:30",
            end: "14:00",
        },
        {
            label: "Matinee Show (2:30 PM)",
            start: "14:30",
            end: "18:00",
        },
        {
            label: "Evening Show (6:30 PM)",
            start: "18:30",
            end: "22:00",
        },
        {
            label: "Night Show (10:30 PM)",
            start: "22:30",
            end: "23:59",
        },
    ];

    const handleShowTimingChange = (value) => {
        const selectedTiming = DEFAULT_SHOW_TIMINGS.find(
            (timing) => timing.label === value
        );

        if (!selectedTiming) return;

        const today = new Date(showDate);

        const formatDateTimeLocal = (date) => {
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
        };

        const startDate = new Date(today);
        const [startHour, startMinute] = selectedTiming.start.split(":");

        startDate.setHours(startHour, startMinute, 0);

        const endDate = new Date(today);
        const [endHour, endMinute] = selectedTiming.end.split(":");

        endDate.setHours(endHour, endMinute, 0);

        setShowForm({
            ...showForm,
            show_timing: value,
            start_time: formatDateTimeLocal(startDate),
            end_time: formatDateTimeLocal(endDate),
        });
    };

    const handlePlaceChanged = (place) => {
        if (!place) return;

        setTheaterForm((prev) => ({
            ...prev,
            location: place.display_name || prev.location,
            formatted_address: place.display_name || prev.formatted_address,
            latitude: place.lat ?? prev.latitude,
            longitude: place.lon ?? prev.longitude,
        }));
    };

    return (
        <AdminRoute>
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Theaters</h1>
                        <p className="mt-2 text-slate-400">
                            Overview of all theaters registered for verification and management. Approve or reject seller-submitted theaters directly from the list.
                        </p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-slate-400">Total Theaters</p>
                            <p className="mt-3 text-3xl font-semibold text-white">{theaters.length}</p>
                        </div>
                        <div className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-300">
                            {theaters.length} registered theaters
                        </div>
                    </div>
                </div>

                {errorMessage && (
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-10 text-center text-slate-300 shadow-2xl backdrop-blur-sm">
                        Loading theaters...
                    </div>
                ) : theaters.length === 0 ? (
                    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-10 text-center text-slate-300 shadow-2xl backdrop-blur-sm">
                        No theaters found for your account.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl">
                        <div className="border-b border-slate-800/70 px-6 py-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Registered Theaters</h2>
                                    <p className="text-sm text-slate-400">Review seller-submitted theater registrations and update their status.</p>
                                </div>
                                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-sm text-slate-300">
                                    {theaters.length} theaters
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-800 text-sm">
                                <thead className="bg-slate-950/80 text-left text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Theater</th>
                                        <th className="px-6 py-4 font-medium">Owner</th>
                                        <th className="px-6 py-4 font-medium">Location</th>
                                        <th className="px-6 py-4 text-right font-medium">Screens</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 bg-slate-900/80">
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
                                            <tr key={theaterId || theater.theater_name} className="border-b border-slate-800 last:border-0">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="font-semibold text-white">{theater.theater_name || "Untitled Theater"}</div>
                                                    <div className="mt-1 text-slate-500 text-xs">{theater.city || "Unknown city"}{theater.state ? `, ${theater.state}` : ""}</div>
                                                </td>
                                                <td className="px-6 py-4 align-top text-slate-300">{ownerName}</td>
                                                <td className="px-6 py-4 align-top text-slate-300 max-w-[240px] truncate">{location}</td>
                                                <td className="px-6 py-4 align-top text-right text-slate-300">{screenCount}</td>
                                                <td className="px-6 py-4 align-top">
                                                    <select
                                                        value={currentStatus}
                                                        onChange={(e) => handleStatusChange(theaterId, e.target.value)}
                                                        disabled={statusUpdatingId === theaterId}
                                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-500"
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

export default AdminTheatersPage;
