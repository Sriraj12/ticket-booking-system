"use client";

import { useEffect, useState } from "react";
import LocationAutocomplete from "../LocationAutocomplete";

const AdminHeader = () => {
    const [selectedLocation, setSelectedLocation] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("selectedCity") || "";
        setSelectedLocation(saved);
        setLocationInput(saved);
    }, []);

    const openLocationModal = () => setShowLocationModal(true);
    const closeLocationModal = () => setShowLocationModal(false);
    const saveLocation = () => {
        const city = locationInput?.trim();
        if (!city) return closeLocationModal();
        localStorage.setItem("selectedCity", city);
        setSelectedLocation(city);
        setShowLocationModal(false);
    };

    return (
        <header className="border-b border-slate-800/70 bg-slate-950/95 px-6 py-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Admin Dashboard</p>
                    <h2 className="text-2xl font-semibold text-white">Overview</h2>
                </div>

                <div className="flex items-center gap-4">

                    {/* Location Selector */}
                    <button
                        onClick={openLocationModal}
                        className="rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                    >
                        <div className="text-xs text-slate-400">Location</div>
                        <div className="font-semibold">{selectedLocation || "Select city"}</div>
                    </button>

                    {/* Admin Profile */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                            A
                        </div>

                        <div className="text-right">
                            <p className="font-medium text-white">Administrator</p>
                            <p className="text-sm text-slate-400">admin@example.com</p>
                        </div>
                    </div>

                </div>

                {/* <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold">
                        A
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-white">Administrator</p>
                        <p className="text-sm text-slate-400">admin@example.com</p>
                    </div>
                </div> */}

            </div>

            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-950/95 p-8 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-semibold text-white">Select your city</p>
                                <p className="mt-1 text-slate-400">Choose where you want to manage theaters and data.</p>
                            </div>
                            <button onClick={closeLocationModal} className="text-slate-400 hover:text-white">Close</button>
                        </div>

                        <div className="mt-6">
                            <LocationAutocomplete value={locationInput} onChange={setLocationInput} />

                            <div className="mt-4 flex gap-3 justify-end">
                                <button onClick={saveLocation} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950">Save</button>
                                <button onClick={closeLocationModal} className="rounded-full border px-5 py-2 text-sm text-slate-200">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;
