"use client";

import { useEffect, useState } from "react";
import SellerRoute from "@/components/SellerRoute";
import API from "@/lib/api";

const formatCurrency = (value) => {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value || "₹0";
};

const emptyTheater = {
  theater_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  status: "active",
};

const emptyScreen = {
  screen_name: "",
  seat_capacity: "",
  screen_type: "Standard",
};

const emptyShow = {
  movie_title: "",
  screen_id: "",
  start_time: "",
  end_time: "",
  ticket_price: "",
};

const SellerTheatersPage = () => {
  const [theaters, setTheaters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [theaterForm, setTheaterForm] = useState(emptyTheater);
  const [screenForm, setScreenForm] = useState(emptyScreen);
  const [showForm, setShowForm] = useState(emptyShow);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetchTheaters();
  }, []);


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

  const getTheaterId = (theater) => theater?.id ?? theater?._id;

  const fetchTheaters = async () => {
    try {
      const response = await API.get("theater/theaters");
      const data = response.data;
      setTheaters(data?.theaters || []);
    } catch (error) {
      console.error("Error fetching theaters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (modalType, theater = null) => {
    setErrorMessage("");
    setSelectedTheater(theater);
    if (modalType === "editTheater") {
      setTheaterForm({
        theater_name: theater?.theater_name || "",
        address: theater?.address || "",
        city: theater?.city || "",
        state: theater?.state || "",
        pincode: theater?.pincode || "",
        status: theater?.status || "active",
      });
    } else {
      setTheaterForm(emptyTheater);
    }

    if (modalType === "addScreen") {
      setScreenForm(emptyScreen);
    }

    if (modalType === "addShow") {
      setShowForm({
        ...emptyShow,
        screen_id:
          theater?.screens?.[0]?.id ?? theater?.screens?.[0]?._id ?? "",
      });
    }

    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTheater(null);
    setErrorMessage("");
  };

  const handleTheaterSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        theater_name: theaterForm.theater_name,
        location: theaterForm.address,
        city: theaterForm.city,
        state: theaterForm.state,
      };

      if (activeModal === "addTheater") {
        await API.post("theater/create-theater", payload);
      } else if (activeModal === "editTheater") {
        const theaterId = getTheaterId(selectedTheater);
        await API.put(`theater/theaters/${theaterId}`, payload);
      }

      await fetchTheaters();
      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Unable to save theater.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const theaterId = getTheaterId(selectedTheater);
      await API.post(`screen/create-screen`, {
        screen_name: screenForm.screen_name,
        total_seats: Number(screenForm.seat_capacity) || 0,
        theater_id: theaterId
      });

      await fetchTheaters();
      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Unable to add screen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    

    try {
      const theaterId = getTheaterId(selectedTheater);
      await API.post(`show/create`, {
        movie_id: showForm.movie_id,
        theater_id: theaterId,
        screen_id: showForm.screen_id,
        show_start_time: showForm.start_time,
        show_end_time: showForm.end_time,
        base_price: Number(showForm.ticket_price) || 0,
      });

      await fetchTheaters();
      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Unable to add show.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("showForm", showForm)

  const totalScreens = theaters.reduce((total, theater) => {
    if (Array.isArray(theater.screens)) return total + theater.screens.length;
    if (typeof theater.total_screens === "number") return total + theater.total_screens;
    if (typeof theater.screen_count === "number") return total + theater.screen_count;
    return total;
  }, 0);

  const activeShows = theaters.reduce((total, theater) => {
    if (Array.isArray(theater.shows)) return total + theater.shows.length;
    if (typeof theater.active_shows === "number") return total + theater.active_shows;
    return total;
  }, 0);

  const totalRevenue = theaters.reduce((total, theater) => {
    if (typeof theater.revenue === "number") return total + theater.revenue;
    if (typeof theater.total_revenue === "number") return total + theater.total_revenue;
    return total;
  }, 0);

  return (
    <SellerRoute>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Theaters</h1>
            <p className="mt-2 text-slate-400">
              Review all theaters under your seller account and manage screens and shows.
            </p>
          </div>
          <button
            onClick={() => openModal("addTheater")}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-red-600"
          >
            + Add Theater
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-slate-400">Total Theaters</p>
            <p className="mt-4 text-3xl font-semibold text-white">{theaters.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-slate-400">Total Screens</p>
            <p className="mt-4 text-3xl font-semibold text-white">{totalScreens}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-slate-400">Active Shows</p>
            <p className="mt-4 text-3xl font-semibold text-white">{activeShows}</p>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-slate-400">Total Revenue</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-10 text-center text-slate-300 shadow-2xl backdrop-blur-sm">
            Loading theaters...
          </div>
        ) : theaters.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-10 text-center text-slate-300 shadow-2xl backdrop-blur-sm">
            No theaters found for your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {theaters.map((theater) => {
              const screenCount = Array.isArray(theater.screens)
                ? theater.screens.length
                : theater.total_screens ?? theater.screen_count ?? "—";
              const showCount = Array.isArray(theater.shows)
                ? theater.shows.length
                : theater.active_shows ?? "—";
              const theaterRevenue = typeof theater.revenue === "number"
                ? theater.revenue
                : typeof theater.total_revenue === "number"
                  ? theater.total_revenue
                  : 0;

              return (
                <div
                  key={getTheaterId(theater) || theater.theater_name}
                  className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-amber-500/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">{theater.theater_name || "Untitled Theater"}</h2>
                      <p className="mt-2 text-slate-400">
                        {theater.city || "Unknown City"}{theater.state ? `, ${theater.state}` : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theater.status === "inactive" ? "bg-slate-800 text-slate-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {theater.status ? theater.status.toUpperCase() : "ACTIVE"}
                    </span>
                  </div>

                  <p className="mt-5 text-slate-300 line-clamp-2">{theater.address || "No address information available."}</p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
                    <div className="rounded-3xl bg-slate-950/70 p-4">
                      <p>Screen Count</p>
                      <p className="mt-3 text-xl font-semibold text-white">{screenCount}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/70 p-4">
                      <p>Active Shows</p>
                      <p className="mt-3 text-xl font-semibold text-white">{showCount}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-400">
                    <span>Total Revenue</span>
                    <span className="font-semibold text-white">{formatCurrency(theaterRevenue)}</span>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => openModal("editTheater", theater)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-500/70 hover:text-amber-200"
                    >
                      Edit Theater
                    </button>
                    <button
                      onClick={() => openModal("addScreen", theater)}
                      className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      + Add Screen
                    </button>
                    <button
                      onClick={() => openModal("addShow", theater)}
                      className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:from-amber-400 hover:to-red-600"
                    >
                      + Add Show
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeModal === "addTheater" && "Add Theater"}
                    {activeModal === "editTheater" && "Edit Theater"}
                    {activeModal === "addScreen" && "Add Screen"}
                    {activeModal === "addShow" && "Add Show"}
                  </h2>
                  <p className="mt-2 text-slate-400">
                    {activeModal === "addTheater" && "Create a new theater location."}
                    {activeModal === "editTheater" && "Update the selected theater details."}
                    {activeModal === "addScreen" && "Add a new screen to this theater."}
                    {activeModal === "addShow" && "Schedule a new show for this theater."}
                  </p>
                </div>
                <button
                  onClick={closeModal}
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

              {(activeModal === "addTheater" || activeModal === "editTheater") && (
                <form onSubmit={handleTheaterSubmit} className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Theater Name
                    <input
                      value={theaterForm.theater_name}
                      onChange={(e) => setTheaterForm({ ...theaterForm, theater_name: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Address
                    <input
                      value={theaterForm.address}
                      onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    City
                    <input
                      value={theaterForm.city}
                      onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    State
                    <input
                      value={theaterForm.state}
                      onChange={(e) => setTheaterForm({ ...theaterForm, state: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Pincode
                    <input
                      value={theaterForm.pincode}
                      onChange={(e) => setTheaterForm({ ...theaterForm, pincode: e.target.value })}
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Status
                    <select
                      value={theaterForm.status}
                      onChange={(e) => setTheaterForm({ ...theaterForm, status: e.target.value })}
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
                      {isSubmitting ? "Saving..." : activeModal === "addTheater" ? "Create Theater" : "Update Theater"}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === "addScreen" && (
                <form onSubmit={handleScreenSubmit} className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-300">
                    Screen Name
                    <input
                      value={screenForm.screen_name}
                      onChange={(e) => setScreenForm({ ...screenForm, screen_name: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300">
                    Seat Capacity
                    <input
                      type="number"
                      min="0"
                      value={screenForm.seat_capacity}
                      onChange={(e) => setScreenForm({ ...screenForm, seat_capacity: e.target.value })}
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                    Screen Type
                    <input
                      value={screenForm.screen_type}
                      onChange={(e) => setScreenForm({ ...screenForm, screen_type: e.target.value })}
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Create Screen"}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === "addShow" && (
                <form onSubmit={handleShowSubmit} className="grid gap-4 sm:grid-cols-2">

                  {/* Movie Dropdown */}
                  <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                    Select Movie

                    <select
                      value={showForm.movie_id}
                      onChange={(e) =>
                        setShowForm({
                          ...showForm,
                          movie_id: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    >
                      <option value="">Select Movie</option>

                      {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                          {movie.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Screen Dropdown */}
                  <label className="space-y-2 text-sm text-slate-300">
                    Screen

                    <select
                      value={showForm.screen_id}
                      onChange={(e) =>
                        setShowForm({
                          ...showForm,
                          screen_id: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    >
                      <option value="">Select screen</option>

                      {selectedTheater?.screens?.map((screen) => (
                        <option
                          key={screen.id}
                          value={screen.id}
                        >
                          {screen.screen_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Start Time */}
                  <label className="space-y-2 text-sm text-slate-300">
                    Start Time

                    <input
                      type="datetime-local"
                      value={showForm.start_time}
                      onChange={(e) =>
                        setShowForm({
                          ...showForm,
                          start_time: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>

                  {/* End Time */}
                  <label className="space-y-2 text-sm text-slate-300">
                    End Time

                    <input
                      type="datetime-local"
                      value={showForm.end_time}
                      onChange={(e) =>
                        setShowForm({
                          ...showForm,
                          end_time: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>

                  {/* Ticket Price */}
                  <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
                    Ticket Price

                    <input
                      type="number"
                      min="0"
                      value={showForm.ticket_price}
                      onChange={(e) =>
                        setShowForm({
                          ...showForm,
                          ticket_price: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </label>

                  {/* Submit Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Create Show"}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </SellerRoute>
  );
};

export default SellerTheatersPage;
