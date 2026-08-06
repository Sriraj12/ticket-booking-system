"use client";

import { useEffect, useState } from "react";
import SellerRoute from "@/components/SellerRoute";
import API from "@/lib/api";
import LocationAutocomplete from "@/components/LocationAutocomplete";

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

const SellerTheatersPage = () => {
    const [theaters, setTheaters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedTheater, setSelectedTheater] = useState(null);
    const [theaterForm, setTheaterForm] = useState(emptyTheater);
    const [screenForm, setScreenForm] = useState(emptyScreen);
    const [showForm, setShowForm] = useState(emptyShow);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            const response = await API.get("theater/theaters");
            const data = response.data;
            setTheaters(data?.theaters || []);
        } catch (error) {
            console.error("Error fetching theaters:", error);
        } finally {
            setIsLoading(false);
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
        <SellerRoute>
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-black">Theaters</h1>
                        <p className="mt-2 text-slate-600">
                            Review all theaters under your seller account and manage screens and shows.
                        </p>
                    </div>
                    <button
                        onClick={() => openModal("addTheater")}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-black to-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:from-slate-700 hover:to-slate-500"
                    >
                        + Add Theater
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                        <p className="text-slate-600">Total Theaters</p>
                        <p className="mt-4 text-3xl font-semibold text-black">{theaters.length}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                        <p className="text-slate-600">Total Screens</p>
                        <p className="mt-4 text-3xl font-semibold text-black">{totalScreens}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                        <p className="text-slate-600">Active Shows</p>
                        <p className="mt-4 text-3xl font-semibold text-black">{activeShows}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur-sm">
                        <p className="text-slate-600">Total Revenue</p>
                        <p className="mt-4 text-3xl font-semibold text-black">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-700 shadow-2xl backdrop-blur-sm">
                        Loading theaters...
                    </div>
                ) : theaters.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-700 shadow-2xl backdrop-blur-sm">
                        No theaters found for your account.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        {theaters.map((theater) => {
                            const screenCount = Array.isArray(theater.screens)
                                ? theater.screens.length
                                : theater.total_screens ?? theater.screen_count ?? "—";
                            const showCount = Array.isArray(theater.total_shows)
                                ? theater.total_shows.length
                                : theater.total_shows ?? "—";
                            const theaterRevenue = typeof theater.revenue === "number"
                                ? theater.revenue
                                : typeof theater.total_revenue === "number"
                                    ? theater.total_revenue
                                    : 0;

                            return (
                                <div
                                    key={getTheaterId(theater) || theater.theater_name}
                                    className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-black/10"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-semibold text-black">{theater.theater_name || "Untitled Theater"}</h2>
                                            <p className="mt-2 text-slate-600">
                                                {theater.city || "Unknown City"}{theater.state ? `, ${theater.state}` : ""}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theater.status === "inactive" ? "bg-black/10 text-slate-600" : "bg-green-500/10 text-slate-700"}`}>
                                            {theater.status ? theater.status.toUpperCase() : "ACTIVE"}
                                        </span>
                                    </div>

                                    <p className="mt-5 text-slate-700 line-clamp-2">{theater.address || "No address information available."}</p>

                                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                        <div className="rounded-3xl bg-white/80 p-4">
                                            <p>Screen Count</p>
                                            <p className="mt-3 text-xl font-semibold text-black">{screenCount}</p>
                                        </div>
                                        <div className="rounded-3xl bg-white/80 p-4">
                                            <p>Active Shows</p>
                                            <p className="mt-3 text-xl font-semibold text-black">{showCount}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between rounded-3xl bg-white/80 p-4 text-sm text-slate-600">
                                        <span>Total Revenue</span>
                                        <span className="font-semibold text-black">{formatCurrency(theaterRevenue)}</span>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={() => openModal("editTheater", theater)}
                                            className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-black transition hover:border-black/70 hover:text-amber-900"
                                        >
                                            Edit Theater
                                        </button>
                                        <button
                                            onClick={() => openModal("addScreen", theater)}
                                            className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-black transition hover:border-black/70 hover:text-amber-900"
                                        >
                                            + Add Screen
                                        </button>
                                        <button
                                            onClick={() => openModal("addShow", theater)}
                                            className="w-full rounded-2xl bg-gradient-to-r from-black to-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-slate-700 hover:to-slate-500"
                                        >
                                            + Add Show
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
                        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-300/80 bg-slate-100/95 p-6 shadow-2xl">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {activeModal === "addTheater" && "Add Theater"}
                                        {activeModal === "editTheater" && "Edit Theater"}
                                        {activeModal === "addScreen" && "Add Screen"}
                                        {activeModal === "addShow" && "Add Show"}
                                    </h2>
                                    <p className="mt-2 text-slate-600">
                                        {activeModal === "addTheater" && "Create a new theater location."}
                                        {activeModal === "editTheater" && "Update the selected theater details."}
                                        {activeModal === "addScreen" && "Add a new screen to this theater."}
                                        {activeModal === "addShow" && "Schedule a new show for this theater."}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700 hover:bg-black/10"
                                >
                                    Close
                                </button>
                            </div>

                            {errorMessage && (
                                <div className="mb-4 rounded-3xl bg-black/5 border border-black/10 p-4 text-sm text-slate-600">
                                    {errorMessage}
                                </div>
                            )}

                            {(activeModal === "addTheater" || activeModal === "editTheater") && (
                                <form onSubmit={handleTheaterSubmit} className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Theater Name
                                        <input
                                            value={theaterForm.theater_name}
                                            onChange={(e) => setTheaterForm({ ...theaterForm, theater_name: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <LocationAutocomplete
                                        value={theaterForm.location}
                                        onChange={(v) => setTheaterForm({ ...theaterForm, location: v })}
                                        onSelect={(place) => handlePlaceChanged(place)}
                                    />
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Location
                                        <input
                                            value={theaterForm.location}
                                            onChange={(e) => setTheaterForm({ ...theaterForm, location: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700">
                                        City
                                        <input
                                            value={theaterForm.city}
                                            onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700">
                                        State
                                        <input
                                            value={theaterForm.state}
                                            onChange={(e) => setTheaterForm({ ...theaterForm, state: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    {/* <label className="space-y-2 text-sm text-slate-700">
                                        Pincode
                                        <input
                                        value={theaterForm.pincode}
                                        onChange={(e) => setTheaterForm({ ...theaterForm, pincode: e.target.value })}
                                        className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label> */}
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Status
                                        <select
                                            value={theaterForm.status}
                                            onChange={(e) => setTheaterForm({ ...theaterForm, status: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </label>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-black to-slate-700 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/10 transition hover:from-slate-700 hover:to-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : activeModal === "addTheater" ? "Create Theater" : "Update Theater"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeModal === "addScreen" && (
                                <form onSubmit={handleScreenSubmit} className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Screen Name
                                        <input
                                            value={screenForm.screen_name}
                                            onChange={(e) => setScreenForm({ ...screenForm, screen_name: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Seat Capacity
                                        <input
                                            type="number"
                                            min="0"
                                            value={screenForm.seat_capacity}
                                            onChange={(e) => setScreenForm({ ...screenForm, seat_capacity: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Screen Type
                                        <input
                                            value={screenForm.screen_type}
                                            onChange={(e) => setScreenForm({ ...screenForm, screen_type: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        No of Rows
                                        <input
                                            value={screenForm.no_of_rows}
                                            onChange={(e) => setScreenForm({ ...screenForm, no_of_rows: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Row Labels: {generateRowLabels(screenForm.no_of_rows).join(",")}
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Seats Per Row
                                        <input
                                            value={screenForm.seats_per_row}
                                            onChange={(e) => setScreenForm({ ...screenForm, seats_per_row: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Premium Rows
                                        <input
                                            value={screenForm.premium_rows}
                                            onChange={(e) => setScreenForm({ ...screenForm, premium_rows: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Recliner Rows
                                        <input
                                            value={screenForm.recliner_rows}
                                            onChange={(e) => setScreenForm({ ...screenForm, recliner_rows: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-black to-slate-700 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/10 transition hover:from-slate-700 hover:to-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : "Create Screen"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeModal === "addShow" && (
                                <form onSubmit={handleShowSubmit} className="grid gap-4 sm:grid-cols-2">

                                    {/* Movie Dropdown */}
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Select Movie

                                        <select
                                            value={showForm.movie_id}
                                            onChange={(e) =>
                                                setShowForm({
                                                    ...showForm,
                                                    movie_id: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        >
                                            <option value="">Select Movie</option>

                                            {movies.map((movie) => (
                                                <option key={movie.id} value={movie.id}>
                                                    {movie.title}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    {/* Screen Dropdown */}
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Screen

                                        <select
                                            value={showForm.screen_id}
                                            onChange={(e) =>
                                                setShowForm({
                                                    ...showForm,
                                                    screen_id: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        >
                                            <option value="">Select screen</option>

                                            {selectedTheater?.screens?.map((screen) => (
                                                <option
                                                    key={screen.id}
                                                    value={screen.id}
                                                >
                                                    {screen.screen_name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Customize Show Timing

                                        <button
                                            onClick={() => setShowCustomizeTiming(!showCustomizeTiming)}
                                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${showCustomizeTiming
                                                ? "bg-green-500"
                                                : "bg-slate-200"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${showCustomizeTiming
                                                    ? "translate-x-8"
                                                    : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-700">
                                        Show Date

                                        <input
                                            type="date"
                                            value={showDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) =>
                                                setShowDate(e.target.value)
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>
                                    {!showCustomizeTiming && <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Default Show Timing

                                        <select
                                            value={showForm.show_timing || ""}
                                            onChange={(e) => handleShowTimingChange(e.target.value)}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        >
                                            <option value="">Select Show Timing</option>

                                            {DEFAULT_SHOW_TIMINGS.map((timing) => (
                                                <option key={timing.label} value={timing.label}>
                                                    {timing.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>}

                                    {/* Start Time */}
                                    {showCustomizeTiming &&
                                        <>
                                            <label className="space-y-2 text-sm text-slate-700">
                                                Start Time

                                                <input
                                                    type="time"
                                                    value={showForm.start_time}
                                                    onChange={(e) =>
                                                        setShowForm({
                                                            ...showForm,
                                                            start_time: e.target.value,
                                                        })
                                                    }
                                                    required
                                                    className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                                />
                                            </label>

                                            <label className="space-y-2 text-sm text-slate-700">
                                                End Time

                                                <input
                                                    type="time"
                                                    value={showForm.end_time}
                                                    onChange={(e) =>
                                                        setShowForm({
                                                            ...showForm,
                                                            end_time: e.target.value,
                                                        })
                                                    }
                                                    required
                                                    className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                                />
                                            </label>
                                        </>
                                    }

                                    {/* Ticket Price */}
                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Base Ticket Price
                                        <input
                                            type="number"
                                            min="0"
                                            value={showForm.base_ticket_price}
                                            onChange={(e) =>
                                                setShowForm({
                                                    ...showForm,
                                                    base_ticket_price: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>

                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Premium Ticket Price
                                        <input
                                            type="number"
                                            min="0"
                                            value={showForm.premium_ticket_price}
                                            onChange={(e) =>
                                                setShowForm({
                                                    ...showForm,
                                                    premium_ticket_price: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>

                                    <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                                        Recliner Ticket Price
                                        <input
                                            type="number"
                                            min="0"
                                            value={showForm.recliner_ticket_price}
                                            onChange={(e) =>
                                                setShowForm({
                                                    ...showForm,
                                                    recliner_ticket_price: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-100 px-4 py-3 text-black outline-none focus:border-black"
                                        />
                                    </label>

                                    {/* Submit Button */}
                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-black to-slate-700 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/10 transition hover:from-slate-700 hover:to-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : "Create Show"}
                                        </button>
                                    </div>

                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SellerRoute>
    );
};

export default SellerTheatersPage;
