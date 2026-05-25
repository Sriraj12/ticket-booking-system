"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import useSWR from "swr";
import API from "@/lib/api";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import PrivateRoute from "@/components/PrivateRoute";

function CheckoutPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const showId = params.get("showId");

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatIds, setSeatIds] = useState([]);
  const [expiry, setExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    if (seatIds.length > 0 && showId) {
      getSelectedSeatDetails();
    }
  }, [seatIds, showId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          alert("Session expired");
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/user/selected-show/${showId}`);
      setShow(res.data.show);

      const seatRes = await API.get(`/user/shows/${showId}/lock-seats`);
      setSeatIds(seatRes.data.locked_seats);

      if (seatRes.data.length === 0) {
        alert("No seats selected");
        router.push("/");
        return;
      }

      const exp = localStorage.getItem("lock_expiry");
      if (exp) setExpiry(new Date(exp));
    } catch (err) {
      console.error(err);
    }
  };

  const getSelectedSeatDetails = async () => {
    try {
      const res = await API.post(`/user/selected-seat-details`, {
        seat_ids: seatIds.map((s) => Number(s.seat_id)),
        show_id: showId,
      });
      const allSeats = res.data.seats;
      setSeats(allSeats);
    } catch (err) {
      console.error(err);
    }
  };

  const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // const confirmBooking = async (bookingId) => {
  //   setIsProcessing(true);
  //   try {
  //     const res = await API.post("/user/bookings/confirm", {
  //       show_id: showId,
  //       seat_ids: seatIds.map((s) => Number(s.seat_id)),
  //       payment_gateway: "Razorpay",
  //     });

  //     router.push(`/booking-success/${res.data.booking_id}`);
  //   } catch (err) {
  //     alert(err.response?.data?.message);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // }

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      
      const res = await API.post("/user/bookings/confirm", {
        show_id: showId,
        seat_ids: seatIds.map((s) => Number(s.seat_id)),
        payment_gateway: "Razorpay",
      });

      const bookingId = res.data.booking_id;

      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await API.post("/user/bookings/payment", {
        amount: totalAmount,
      });

      const order = orderRes.data.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        handler: async function (response) {
          try {
            await API.post("/user/bookings/payment/verify", {
              ...response,
              booking_id: bookingId,
            });

            router.push(`/booking-success/${bookingId}`);

          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed. Please try again.");
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const clearSelectedSeats = async () => {
    try {
      await API.post("/user/bookings/unlock-seats", {
        show_id: showId
      });
    } catch (err) {
      console.error("Error clearing seats:", err);
    }
  }

  const handleBack = () => {
    clearSelectedSeats();
    router.back();
  };

  console.log("show", show)

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
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors max-w-4xl mx-auto"
      >
        ← Back
      </motion.button>

      {/* Header */}
      <Header />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Movie Info Card */}
          {show && (
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🎬</span> Show Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-slate-600/50">
                  <div>
                    <p className="text-slate-400 text-sm">Movie</p>
                    <p className="text-white font-semibold text-lg">
                      {show.movie.title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Theater</p>
                    <p className="text-white font-semibold">{show.theater.theater_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Screen</p>
                    <p className="text-white font-semibold">{show.screen.screen_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Show Time</p>
                  <p className="text-white font-semibold">
                    {new Date(show.show_start_time).toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seats Info Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>💺</span> Your Seats
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-3">Selected Seats</p>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat) => (
                    <motion.span
                      key={seat.id}
                      whileHover={{ scale: 1.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-red-600/20 border border-amber-500/50 text-amber-400 rounded-lg font-semibold"
                    >
                      {seat.seat_number}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-600/50 pt-4">
                <p className="text-slate-400 text-sm">Price per Seat</p>
                <p className="text-white font-semibold text-lg">
                  ₹{seats.length > 0 ? seats[0].price : 0}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar - Price Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          {/* Timer Card */}
          <motion.div
            animate={{ borderColor: timeLeft < 60 ? "#dc2626" : "#f59e0b" }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl mb-6"
          >
            <p className="text-slate-400 text-sm mb-2">Lock Expires in</p>
            <p
              className={`text-4xl font-bold font-mono ${
                timeLeft < 60 ? "text-red-500" : "text-amber-400"
              }`}
            >
              {formatTime(timeLeft)}
            </p>
            <p className="text-slate-400 text-xs mt-2">Minutes and seconds</p>
          </motion.div>

          {/* Price Summary Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Bill Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Seats ({seats.length})</span>
                <span className="text-white font-semibold">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Convenience Fee</span>
                <span className="text-white font-semibold">₹0</span>
              </div>
            </div>

            <div className="border-t border-slate-600/50 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-600 bg-clip-text text-transparent">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <motion.button
              onClick={handlePayment}
              disabled={isProcessing || seats.length === 0}
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold rounded-lg hover:from-amber-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Pay Now"
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <PrivateRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutPageContent />
      </Suspense>
    </PrivateRoute>
  );
}