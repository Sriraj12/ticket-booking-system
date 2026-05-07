"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get(`/user/movie/shows/${id}`);
      setMovie(res.data.movie);
      setShows(res.data.shows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedShows = shows.reduce((acc, show) => {
    const key = show.theater.theater_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(show);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full"
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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6"
    >
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
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
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
            <img
              src={movie.poster_url || "https://via.placeholder.com/300"}
              alt={movie.title}
              className="w-full h-auto object-cover"
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
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
                  {movie.genre}
                </span>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                  ⭐ {movie.rating || "N/A"}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-700 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold min-w-24">Duration:</span>
                <span className="text-slate-300">{movie.duration} minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold min-w-24">Language:</span>
                <span className="text-slate-300">{movie.language || "Hindi"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold min-w-24">Format:</span>
                <span className="text-slate-300">2D, 3D, 4DX</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-amber-500/10 to-red-600/10 border border-amber-500/20 rounded-lg p-4"
            >
              <p className="text-slate-300 text-sm">
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
          <span className="bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent">
            Available Shows
          </span>
        </h2>

        <div className="space-y-6">
          {Object.keys(groupedShows).map((theater, theaterIndex) => (
            <motion.div
              key={theater}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: theaterIndex * 0.1 }}
              className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎭</span>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {theater}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {groupedShows[theater][0].theater.city}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {groupedShows[theater].map((show) => (
                  <motion.div
                    key={show.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/shows/${show.id}`)}
                    className="cursor-pointer"
                  >
                    <button className="w-full px-4 py-3 border-2 border-amber-500 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white hover:border-amber-600 font-semibold transition-all duration-300 shadow-lg hover:shadow-amber-500/50">
                      <div className="font-bold text-base">
                        {new Date(show.start_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </div>
                      <div className="text-xs opacity-75">
                        {show.screen.screen_name}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}