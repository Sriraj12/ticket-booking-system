"use client";

import { useEffect, useState } from "react";
import SellerRoute from "@/components/SellerRoute";
import { motion } from "framer-motion";
import API from "@/lib/api";


const SellerMoviesPage = () => {

    const emptyMovie = {
        title: "",
        language: "",
        duration: "",
        genre: "",
        release_date: "",
        poster_url: "",
        trailer_url: "",
        is_active: ""
    }

    const [movies, setMovies] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMovieModal, setShowAddMovieModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [movieForm, setMovieForm] = useState(emptyMovie)

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

    const closeModal = () => {
        setShowAddMovieModal(false)
        setErrorMessage("");
    };

    const handleTheaterSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                title: movieForm.title,
                language: movieForm.language,
                duration: movieForm.duration,
                genre: movieForm.genre,
                release_date: movieForm.release_date,
                poster_url: movieForm.poster_url,
                trailer_url: movieForm.trailer_url,
                is_active: true
            };

            await API.post("seller/movie", payload);

            await fetchMovies();
            closeModal();
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Unable to save theater.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleMovieStatus = async (movieId, currentStatus) => {
        try {

            await API.put(`/seller/movie/${movieId}/status-update`, {
                is_active: !currentStatus,
            });

            setMovies((prevMovies) =>
                prevMovies.map((movie) =>
                    movie.id === movieId
                        ? {
                            ...movie,
                            is_active: !currentStatus,
                        }
                        : movie
                )
            );

        } catch (error) {
            console.error("Failed to update movie status", error);
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
                    <button
                        onClick={() => setShowAddMovieModal(true)}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-red-600"
                    >
                        + Add Movies
                    </button>
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
                                        <div className="flex items-center justify-between mt-4">
                                            {/* <span
                                                className={`text-sm font-medium ${movie.is_active ? "text-green-400" : "text-red-400"
                                                    }`}
                                            >
                                                {movie.is_active ? "Active" : "Inactive"}
                                            </span> */}

                                            <button
                                                onClick={() => handleToggleMovieStatus(movie.id, movie.is_active)}
                                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${movie.is_active
                                                    ? "bg-green-500"
                                                    : "bg-slate-600"
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${movie.is_active
                                                        ? "translate-x-8"
                                                        : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                {showAddMovieModal &&
                    (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
                            <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Add Movie
                                        </h2>
                                        <p className="mt-2 text-slate-400">
                                            To be release by this week
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => closeModal()}
                                        className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-slate-300 hover:bg-slate-800"
                                    >
                                        Close
                                    </button>
                                </div>

                                {errorMessage && (
                                    <div className="mb-4 rounded-3xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200">
                                        {errorMessage}
                                    </div>
                                )}


                                <form onSubmit={handleTheaterSubmit} className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Title
                                        <input
                                            value={movieForm.title}
                                            onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Language
                                        <input
                                            value={movieForm.language}
                                            onChange={(e) => setTheaterForm({ ...movieForm, language: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Duration
                                        <input
                                            value={movieForm.duration}
                                            onChange={(e) => setTheaterForm({ ...movieForm, duration: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Genre
                                        <input
                                            value={movieForm.genre}
                                            onChange={(e) => setTheaterForm({ ...movieForm, genre: e.target.value })}
                                            required
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Release Date
                                        <input
                                            value={movieForm.release_date}
                                            onChange={(e) => setTheaterForm({ ...movieForm, release_date: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Poster URL
                                        <input
                                            value={movieForm.poster_url}
                                            onChange={(e) => setTheaterForm({ ...movieForm, poster_url: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Trailer_URL
                                        <input
                                            value={movieForm.trailer_url}
                                            onChange={(e) => setTheaterForm({ ...movieForm, trailer_url: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        />

                                    </label>
                                    <label className="space-y-2 text-sm text-slate-300">
                                        Status
                                        <select
                                            value={movieForm.is_active}
                                            onChange={(e) => setTheaterForm({ ...movieForm, is_active: e.target.value })}
                                            className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </label>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Saving..." : "Add Movie"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div>
        </SellerRoute>
    )
}

export default SellerMoviesPage;