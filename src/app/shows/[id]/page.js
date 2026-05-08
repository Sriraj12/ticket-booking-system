"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function SeatSelectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, []);

  

  const fetchSeats = async () => {
    try {
      const res = await API.get(`/user/shows/${id}/seats`);
      setSeats(res.data.seats);
      setMovieTitle(res.data.movie.title);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (seat.isBooked || seat.isLocked) return;

    setSelectedSeats((prev) =>
      prev.includes(seat.id)
        ? prev.filter((s) => s !== seat.id)
        : [...prev, seat.id]
    );
  };

  const handleSeatSelection = async () => {
    try {
      const res = await API.post(`/user/bookings/lock-seats`, {
        user_id: 2,
        show_id: id,
        seat_ids: selectedSeats.map((seat) => Number(seat)),
      });

      router.push(`/checkout?showId=${id}`);
    } catch (err) {
      console.error("API error:", err);
      alert(err.response?.data?.message || "Failed to lock seats");
    }
  };

  const getSeatColor = (seat) => {
    if (seat.isBooked) return "bg-red-500";
    if (seat.isLocked) return "bg-yellow-400";
    if (selectedSeats.includes(seat.id)) return "bg-gradient-to-r from-amber-400 to-red-500";
    return "bg-gradient-to-r from-green-400 to-emerald-500";
  };

  const seatsWithStatus = seats.map(seat => ({
    ...seat,
    isLocked: seat.seatLocks.length > 0,
    isBooked: seat.bookingSeats.length > 0
  }));

  // Group seats by rows for better visualization
  const groupedSeats = seatsWithStatus.reduce((acc, seat) => {
    const row = seat.seat_number.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const totalAmount = selectedSeats.reduce((total, seatId) => {
    const seat = seats.find(s => s.id === seatId);
    return total + (seat ? seat.price : 0);
  }, 0);

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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6 flex flex-col"
    >
      {/* Header */}
      <Header />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎭</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent">
            Select Your Seats
          </h1>
        </div>
        <p className="text-slate-400 text-lg">{movieTitle}</p>
      </motion.div>

      {/* Back Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
      >
        ← Back to Show Times
      </motion.button>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1"
        >
          {/* Screen Representation */}
          <motion.div
            variants={itemVariants}
            className="mb-8 text-center"
          >
            <div className="relative">
              <div className="w-full h-16 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-t-full shadow-2xl border border-slate-500/50 flex items-center justify-center">
                <span className="text-slate-300 font-semibold text-lg">SCREEN</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-red-600/10 rounded-t-full blur-sm"></div>
            </div>
            <p className="text-slate-400 text-sm mt-2">All eyes this way</p>
          </motion.div>

          {/* Seats Grid */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              <span className="bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent">
                Choose Your Seats
              </span>
            </h2>

            <div className="space-y-4">
              {Object.keys(groupedSeats).map((row) => (
                <motion.div
                  key={row}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Object.keys(groupedSeats).indexOf(row) * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-amber-400 font-bold text-lg w-8 text-center">
                    {row}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {groupedSeats[row].map((seat) => (
                      <motion.button
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.isBooked || seat.isLocked}
                        whileHover={{ scale: seat.isBooked || seat.isLocked ? 1 : 1.1 }}
                        whileTap={{ scale: seat.isBooked || seat.isLocked ? 1 : 0.9 }}
                        className={`w-10 h-10 rounded-lg text-xs font-bold text-white shadow-lg transition-all duration-300 ${
                          seat.isBooked || seat.isLocked
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:shadow-xl'
                        } ${getSeatColor(seat)}`}
                      >
                        {seat.seat_number.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          variants={itemVariants}
          className="lg:w-80 space-y-6"
        >
          {/* Legend */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-4">Seat Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded"></div>
                <span className="text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-red-500 rounded"></div>
                <span className="text-slate-300">Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <span className="text-slate-300">Booked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                <span className="text-slate-300">Locked</span>
              </div>
            </div>
          </motion.div>

          {/* Selection Summary */}
          {selectedSeats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-amber-500/20 to-red-600/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Your Selection</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Seats Selected</span>
                  <span className="text-white font-semibold">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Total Amount</span>
                  <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-400 text-sm mb-4">
                  Seats will be locked for 5 minutes after selection
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700/50 rounded-t-2xl p-6 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            {selectedSeats.length > 0 ? (
              <span>
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected • ₹{totalAmount}
              </span>
            ) : (
              <span>Please select your seats</span>
            )}
          </div>

          {selectedSeats.length > 0 && (
            <motion.button
              onClick={handleSeatSelection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Proceed to Payment • ₹{totalAmount}
            </motion.button>
          )}
        </div>
      </motion.footer>
    </motion.div>
  );
}