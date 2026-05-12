"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRoute";

function BookingSuccessContent() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const bookingId = Number(id);

      if (isNaN(bookingId)) {
        alert("Invalid booking ID");
        return;
      }

      const res = await API.get(`/user/bookings/${bookingId}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTicket = async (id) => {
    try {
      const res = await API.get(`/user/booking/${id}/ticket`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

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

  if (!booking) {
    return <div className="p-6 text-white text-center">Booking not found</div>;
  }

  const movie = booking.movie;
  const seatNumbers = booking.seats.map((s) => s.seat_number);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6 overflow-hidden"
    >
      {/* Header */}
      <Header />

      {/* Celebrating confetti-like elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 600 }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 0.5,
            }}
            className={`absolute w-2 h-2 rounded-full ${
              i % 2 === 0
                ? "bg-amber-400"
                : i % 3 === 0
                ? "bg-red-500"
                : "bg-yellow-400"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        {/* Success Checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl">✓</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-24 h-24 border-2 border-green-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-3">
            🎉 Booking Confirmed!
          </h1>
          <p className="text-xl text-slate-300">
            Your tickets have been successfully booked. Get ready for an amazing cinema experience!
          </p>
        </motion.div>

        {/* Booking Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Movie Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🎬</span> Movie Details
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Movie Title</p>
                <p className="text-white font-semibold text-lg">{movie.title}</p>
              </div>

              <div className="border-t border-slate-600/50 pt-3">
                <p className="text-slate-400 text-sm">Theater</p>
                <p className="text-white font-semibold">
                  {booking.theater.theater_name}
                </p>
                <p className="text-slate-400 text-sm">
                  {booking.theater.city}
                </p>
              </div>

              <div className="border-t border-slate-600/50 pt-3">
                <p className="text-slate-400 text-sm">Screen</p>
                <p className="text-white font-semibold">
                  {booking.screen.screen_name}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Seats Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>💺</span> Ticket Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-3">Your Seats</p>
                <div className="flex flex-wrap gap-2">
                  {seatNumbers.map((seat) => (
                    <motion.span
                      key={seat}
                      whileHover={{ scale: 1.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-red-600/20 border border-amber-500/50 text-amber-400 rounded-lg font-bold"
                    >
                      {seat}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-600/50 pt-4">
                <p className="text-slate-400 text-sm">Show Time</p>
                <p className="text-white font-semibold text-lg">
                  {new Date(booking.show.start_time).toLocaleDateString({
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  <span className="text-amber-400">
                    {new Date(booking.show.start_time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Final Amount */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-amber-500/20 to-red-600/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 mb-8 text-center"
        >
          <p className="text-slate-300 text-lg mb-2">Total Amount Paid</p>
          <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text">
            ₹{booking.total_amount}
          </p>
        </motion.div>

        {/* Booking ID */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center mb-8"
        >
          <p className="text-slate-400 text-sm mb-2">Booking Reference</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            #{booking.booking_id}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            onClick={() => downloadTicket(booking.booking_id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold rounded-lg hover:from-amber-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>📥</span> Download Ticket
          </motion.button>

          <motion.button
            onClick={() => router.push("/movies")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 bg-slate-700/50 border border-slate-600 text-white font-bold rounded-lg hover:bg-slate-600/50 transition-all flex items-center justify-center gap-2"
          >
            <span>🎬</span> Book More Movies
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function BookingSuccessPage() {
  return (
    <PrivateRoute>
      <BookingSuccessContent />
    </PrivateRoute>
  );
}