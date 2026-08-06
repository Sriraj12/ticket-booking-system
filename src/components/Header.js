"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import LocationAutocomplete from "./LocationAutocomplete";

export default function Header() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        const savedCity = localStorage.getItem("selectedCity") || "";
        setSelectedLocation(savedCity);
        setLocationInput(savedCity);

        if (user && !savedCity) {
            setShowLocationModal(true);
        }
    }, [user]);

    const handleEditProfile = () => {
        alert("Edit profile page is coming soon.");
    };

    const handleBookingHistory = () => {
        router.replace("/history");
    };

    const handleLogout = () => {
        logout();
    };

    const openLocationModal = () => {
        setShowLocationModal(true);
    };

    const closeLocationModal = () => {
        setShowLocationModal(false);
    };

    const handleSaveLocation = () => {
        const city = locationInput?.trim();
        if (!city) {
            alert("Please select your city before continuing.");
            return;
        }

        localStorage.setItem("selectedCity", city);
        setSelectedLocation(city);
        setShowLocationModal(false);
    };

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 max-w-4xl mx-auto bg-slate-900/70 border border-slate-700/60 rounded-3xl p-6 shadow-xl backdrop-blur-xl"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-slate-950 text-2xl font-bold">
                        👤
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Logged in as</p>
                        <p className="text-white font-semibold">{user?.name || "User"}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <button
                        onClick={openLocationModal}
                        className="min-w-[180px] rounded-2xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-left text-white hover:bg-slate-800 transition"
                    >
                        <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-400">
                            Location
                        </span>
                        <span className="font-semibold text-sm text-white">
                            {selectedLocation || "Select your city"}
                        </span>
                    </button>
                    <button
                        onClick={handleBookingHistory}
                        className="px-4 py-2 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
                    >
                        Booking History
                    </button>
                    <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </motion.div>

        {showLocationModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-950/95 p-8 shadow-2xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-2xl font-semibold text-white">Select your nearest city</p>
                            <p className="mt-2 text-slate-400">
                                Choose the city where you want to book tickets now. You can update this anytime from the header.
                            </p>
                        </div>
                        <button
                            onClick={closeLocationModal}
                            className="text-slate-400 hover:text-white"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <LocationAutocomplete value={locationInput} onChange={setLocationInput} />

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={handleSaveLocation}
                                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                            >
                                Save location
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}