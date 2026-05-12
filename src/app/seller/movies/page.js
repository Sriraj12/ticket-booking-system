"use client";

import { useEffect, useState } from "react";
import SellerRoute from "@/components/SellerRoute";
import { motion } from "framer-motion";
import API from "@/lib/api";


const SellerMoviesPage = () => {

    const [movies, setMovies] = useState([])
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const res = await API.get("seller/all-movies");
            setMovies(res.data.allMovies || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <SellerRoute>
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Theaters</h1>
                        <p className="mt-2 text-slate-400">
                            Available Movies
                        </p>
                    </div>
                </div>
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
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </SellerRoute>
    )
}

export default SellerMoviesPage;