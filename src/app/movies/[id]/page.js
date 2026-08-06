"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRoute";

function MovieDetailsContent() {
    const { id } = useParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const formattedDate = selectedDate.toISOString().split("T")[0];

    const city = localStorage.getItem("selectedCity") || "";

    const { data: movieData, error, isLoading } = useSWR(`/user/movie/shows/${id}?date=${formattedDate}&city=${city}`);

    const movie = movieData?.movie;
    const shows = movieData?.shows || [];

    const groupedShows = shows.reduce((acc, show) => {
        const theaterName = show.theater.theater_name;
        const screenName = show.screen.screen_name;

        // Create theater group
        if (!acc[theaterName]) {
            acc[theaterName] = {};
        }

        // Create screen group inside theater
        if (!acc[theaterName][screenName]) {
            acc[theaterName][screenName] = [];
        }

        // Push show into screen group
        acc[theaterName][screenName].push(show);

        return acc;
    }, {});

    const generateDates = () => {
        const dates = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date();

            date.setDate(date.getDate() + i);

            dates.push(date);
        }

        return dates;
    };

    const availableDates = generateDates();

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-white flex items-center justify-center"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-black/10 border-t-amber-500 rounded-full"
                />
            </motion.div>
        );
    }

    if (!movie)
        return (
            <div className="p-6 text-white text-center">Movie not found</div>
        );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-white py-12 px-6"
        >
            {/* Header */}
            <Header />

            {/* Back Button */}
            <motion.button
                whileHover={{ x: -5 }}
                onClick={() => router.back()}
                className="mb-8 flex items-center gap-2 text-black font-semibold hover:text-slate-900 transition-colors"
            >
                ← Back to Movies
            </motion.button>

            {/* Movie Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto"
            >
                {/* Poster */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="col-span-1 flex justify-center"
                >
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative w-full max-w-sm aspect-[2/3]">
                        <Image
                            src={movie.poster_url}
                            alt={movie.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>

                {/* Movie Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="col-span-2"
                >
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-2">{movie.title}</h1>
                            <div className="flex gap-4 flex-wrap">
                                <span className="px-3 py-1 bg-black/10 text-black rounded-full text-sm font-semibold">
                                    {movie.genre}
                                </span>
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                                    ⭐ {movie.rating || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-300 pt-6">
                            <div className="flex items-center gap-3">
                                <span className="text-black font-semibold min-w-24">Duration:</span>
                                <span className="text-slate-700">{movie.duration} minutes</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-black font-semibold min-w-24">Language:</span>
                                <span className="text-slate-700">{movie.language || "Hindi"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-black font-semibold min-w-24">Format:</span>
                                <span className="text-slate-700">2D, 3D, 4DX</span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-r from-black/10 to-slate-700/10 border border-black/10 rounded-lg p-4"
                        >
                            <p className="text-slate-700 text-sm">
                                {movie.description ||
                                    "Experience cinema like never before. Book your seats now and enjoy the ultimate movie experience."}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Shows Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-7xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-white mb-8">
                    <span className="bg-gradient-to-r from-black to-slate-700 bg-clip-text text-transparent">
                        Available Shows
                    </span>
                </h2>

                {/* Calendar Date Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-2xl">📅</span>

                        <h2 className="text-2xl font-bold text-white">
                            Select Date
                        </h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

                        {availableDates.map((date, index) => {

                            const isSelected =
                                selectedDate.toDateString() === date.toDateString();

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedDate(date)}
                                    className={`min-w-[90px] rounded-2xl border p-4 transition-all duration-300 backdrop-blur-xl
                                    ${isSelected
                                            ? "border-black bg-gradient-to-br from-black to-slate-700 text-white shadow-xl shadow-black/10"
                                            : "border-slate-300 bg-black/5 text-slate-700 hover:border-black/40 hover:bg-black/10"
                                        }`}
                                >
                                    <p className="text-sm font-medium">
                                        {date.toLocaleDateString("en-US", {
                                            weekday: "short",
                                        })}
                                    </p>

                                    <p className="text-2xl font-bold mt-1">
                                        {date.getDate()}
                                    </p>

                                    <p className="text-xs mt-1">
                                        {date.toLocaleDateString("en-US", {
                                            month: "short",
                                        })}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="space-y-6">
                    {Object.keys(groupedShows).map((theater, theaterIndex) => (
                        <motion.div
                            key={theater}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: theaterIndex * 0.1 }}
                            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 hover:border-black/30 transition-all"
                        >
                            {/* Theater Header */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-2xl">🎭</span>

                                <div>
                                    <h3 className="text-white font-bold text-xl">
                                        {theater}
                                    </h3>

                                    <p className="text-slate-600 text-sm">
                                        {
                                            Object.values(groupedShows[theater])[0][0]
                                                .theater.city
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* Screen Groups */}
                            <div className="space-y-6">
                                {Object.keys(groupedShows[theater]).map((screenName) => (
                                    <div
                                        key={screenName}
                                        className="rounded-2xl border border-slate-300/40 bg-slate-100/40 p-5"
                                    >
                                        {/* Screen Header */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-lg">🖥️</span>

                                            <h4 className="text-lg font-semibold text-black">
                                                {screenName}
                                            </h4>
                                        </div>

                                        {/* Show Timings */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {groupedShows[theater][screenName].map((show) => (
                                                <motion.div
                                                    key={show.id}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() =>
                                                        router.push(`/shows/${show.id}`)
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <button className="w-full px-4 py-3 border-2 border-black text-black rounded-xl hover:bg-amber-500 hover:text-white hover:border-amber-600 font-semibold transition-all duration-300 shadow-lg hover:shadow-black/10">
                                                        <div className="font-bold text-base">
                                                            {new Date(
                                                                show.show_start_time
                                                            ).toLocaleTimeString("en-US", {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            })}
                                                        </div>

                                                        <div className="text-xs opacity-75 mt-1">
                                                            ₹
                                                            {show.base_price ||
                                                                show.ticket_price}
                                                        </div>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function MovieDetailsPage() {
    return (
        <PrivateRoute>
            <MovieDetailsContent />
        </PrivateRoute>
    );
}