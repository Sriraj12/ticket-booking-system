"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRoute";
import MoviesList from "./MoviesList";

export default function MoviesPage() {
  return (
    <PrivateRoute>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-white py-12 px-6"
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
            <h1 className="text-5xl font-bold bg-gradient-to-r from-black to-slate-700 bg-clip-text text-transparent">
              Now Showing
            </h1>
          </div>
          <p className="text-slate-600 text-lg">Choose your favorite movie and book your tickets</p>
        </motion.div>

        <MoviesList />
      </motion.div>
    </PrivateRoute>
  );
}