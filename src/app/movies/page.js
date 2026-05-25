"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRoute";

function MoviesContent() {
    const router = useRouter();
    const { data: moviesData, error, isLoading } = useSWR("user/movie");

    const movies = moviesData?.movies || [];
    
    const handleSelectMovie = (movie) => {
        router.push(`/movies/${movie.id}`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6"
        >
            {/* Header */}
            <Header />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">🎬</span>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent">
                        Now Showing
                    </h1>
                </div>
                <p className="text-slate-400 text-lg">Choose your favorite movie and book your tickets</p>
            </motion.div>
            

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center min-h-96">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full"
                    />
                </div>
            )}

            {/* Movies Grid */}
            {!isLoading && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
                >
                    {movies.map((movie) => (
                        <motion.div
                            key={movie.id}
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            onClick={() => handleSelectMovie(movie)}
                            className="group cursor-pointer"
                        >
                            <div className="relative overflow-hidden rounded-xl shadow-2xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 bg-slate-800/50 backdrop-blur-xl">
                                {/* Image Container */}
                                <div className="relative h-72 overflow-hidden">
                                    <motion.img
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        whileHover={{ scale: 1.12 }}
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                                        {movie.title}
                                    </h3>
                                    <p className="text-amber-400 text-sm font-semibold mb-3">{movie.genre}</p>

                                    {/* Badge */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-red-700 transition-all shadow-lg"
                                    >
                                        Book Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && movies.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-96"
                >
                    <span className="text-6xl mb-4">🍿</span>
                    <p className="text-slate-400 text-xl">No movies available at the moment</p>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function MoviesPage() {
    return (
        <PrivateRoute>
            <MoviesContent />
        </PrivateRoute>
    );
}