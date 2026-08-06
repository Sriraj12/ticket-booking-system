"use client";

import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Example optimized movie list component using Next.js Image
// Copy this pattern to replace all raw <img> tags across the app

function OptimizedMoviesList() {
  const router = useRouter();
  const { data: moviesData, isLoading } = useSWR("user/movie");

  const movies = moviesData?.movies || [];

  const handleSelectMovie = (movie) => {
    router.push(`/movies/${movie.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
    <>
      {isLoading && (
        <div className="flex justify-center items-center min-h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-black/10 border-t-amber-500 rounded-full"
          />
        </div>
      )}

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
              <div className="relative overflow-hidden rounded-xl shadow-2xl border border-slate-200 hover:border-black/10 transition-all duration-300 bg-black/5 backdrop-blur-xl">
                {/* Image Container with Next.js Image */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={false}
                    placeholder="empty" // or "blur" with blurDataURL
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-black font-bold text-lg mb-2 line-clamp-2 group-hover:text-black transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-black text-sm font-semibold mb-3">{movie.genre}</p>

                  {/* Badge */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 bg-gradient-to-r from-black to-slate-700 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-slate-500 transition-all shadow-lg"
                  >
                    Book Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && movies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-96"
        >
          <span className="text-6xl mb-4">🍿</span>
          <p className="text-slate-600 text-xl">No movies available at the moment</p>
        </motion.div>
      )}
    </>
  );
}

export default OptimizedMoviesList;
