import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsTicketDetailed,
  BsCalendarCheck,
  BsBagCheck,
  BsClockHistory,
  BsCalendarEvent,
  BsGeoAlt,
  BsXCircle,
  BsSearch,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type Booking = {
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  booking_reference: string;
  quantity: number;
  total_amount: string;
  booking_status: string; // pending | confirmed | cancelled | refunded
  event_status: string; // live | completed | cancelled (from events table)
  booking_date: string;
  title: string;
  event_date: string;
  city: string;
  ticket_name: string;
  image_url?: string;
  category?: string;
};

const UserDashboard = () => {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingsAndImages = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/api/bookings/my-bookings/active`, {
          headers: { token: token || "" },
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Could not load bookings.");
        }

        const rawBookings: Booking[] = data.bookings || [];

        // Fetch individual event details concurrently to get image_url and category
        const enhancedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            if ((booking.image_url && booking.category) || !booking.event_id) {
              return booking;
            }
            try {
              const eventRes = await fetch(`${API}/api/events/${booking.event_id}`);
              const eventData = await eventRes.json();
              if (eventData.success && eventData.event) {
                return {
                  ...booking,
                  image_url:
                    booking.image_url ||
                    eventData.event.image_url ||
                    eventData.event.banner_url ||
                    eventData.event.imageUrl ||
                    "",
                  category: booking.category || eventData.event.category || "",
                };
              }
            } catch (err) {
              console.error(`Failed to fetch details for event ${booking.event_id}`, err);
            }
            return booking;
          })
        );

        setBookings(enhancedBookings);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookingsAndImages();
  }, [token]);

  const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const isUpcoming = (eventDateStr: string) => {
    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() >= startOfToday();
  };

  // Filter based on search query and tabs (all, live, completed, cancelled)
  const filteredBookings = bookings.filter((booking) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      booking.title?.toLowerCase().includes(query) ||
      booking.city?.toLowerCase().includes(query) ||
      booking.booking_reference?.toLowerCase().includes(query) ||
      booking.category?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const isLive = isUpcoming(booking.event_date) && booking.booking_status !== "cancelled" && booking.booking_status !== "refunded";
    const isCompleted = !isUpcoming(booking.event_date) && booking.booking_status !== "cancelled" && booking.booking_status !== "refunded";
    const isCancelledOrRefunded = booking.booking_status === "cancelled" || booking.booking_status === "refunded";

    if (selectedTab === "live") return isLive;
    if (selectedTab === "completed") return isCompleted;
    if (selectedTab === "cancelled") return isCancelledOrRefunded;

    return true; // "all"
  });

  const activeBookings = bookings.filter(
    (b) => b.booking_status !== "cancelled" && b.booking_status !== "refunded"
  );
  const liveCount = activeBookings.filter((b) => isUpcoming(b.event_date)).length;
  const completedCount = activeBookings.filter((b) => !isUpcoming(b.event_date)).length;
  const cancelledCount = bookings.filter((b) => b.booking_status === "cancelled" || b.booking_status === "refunded").length;
  const totalBookings = activeBookings.length;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-500 text-white",
      pending: "bg-amber-400 text-amber-950",
      cancelled: "bg-rose-500 text-white",
      refunded: "bg-slate-700 text-white",
    };

    return (
      <span
        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm capitalize ${
          styles[status] || "bg-slate-700 text-white"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-7xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6 pb-20">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl mb-8 border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#e31b88]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
            Attendee Hub
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">Explorer</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Manage your active bookings, review upcoming passes, and jump straight into your next experience.
          </p>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:border-pink-200 transition-all">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-[#e31b88] flex items-center justify-center text-xl shrink-0">
            <BsBagCheck />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{totalBookings}</p>
            <p className="text-xs font-medium text-slate-500">Active Bookings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <BsCalendarCheck />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{liveCount}</p>
            <p className="text-xs font-medium text-slate-500">Live / Upcoming</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl shrink-0">
            <BsClockHistory />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{completedCount}</p>
            <p className="text-xs font-medium text-slate-500">Completed Events</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "all"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedTab("live")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "live"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Live & Upcoming ({liveCount})
          </button>
          <button
            onClick={() => setSelectedTab("completed")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "completed"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Completed ({completedCount})
          </button>
          {cancelledCount > 0 && (
            <button
              onClick={() => setSelectedTab("cancelled")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                selectedTab === "cancelled"
                  ? "bg-[#e31b88] text-white shadow-pink-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Cancelled ({cancelledCount})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <BsSearch
            size={13}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking, event, city..."
            className="w-full pl-11 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm font-medium">
          Loading your bookings and event details...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-rose-500 text-sm font-medium">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md mx-auto">
          <p className="text-slate-800 font-bold mb-1">No bookings found.</p>
          <p className="text-slate-400 text-xs mb-4">Discover exciting events happening around you.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#e31b88] hover:bg-pink-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            Browse Events
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <p className="text-slate-700 font-semibold mb-1">No bookings match your filter or search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTab("all");
            }}
            className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const isLive = isUpcoming(booking.event_date) && booking.booking_status !== "cancelled" && booking.booking_status !== "refunded";
            const isCancelled = booking.booking_status === "cancelled" || booking.booking_status === "refunded";

            return (
              <div
                key={booking.booking_id}
                className={`group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isCancelled ? "opacity-75 bg-rose-50/20" : ""
                }`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                    {booking.image_url ? (
                      <img
                        src={booking.image_url}
                        alt={booking.title}
                        className={`w-full h-full object-group object-cover group-hover:scale-105 transition-transform duration-500 ${
                          !isLive && !isCancelled ? "grayscale" : ""
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-white">
                        <BsCalendarEvent size={28} className="opacity-70" />
                      </div>
                    )}

                    {/* Category badge */}
                    {booking.category && (
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        {booking.category}
                      </span>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {statusBadge(booking.booking_status)}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="text-[11px] font-medium text-slate-400 mb-1">
                    {formatDate(booking.event_date)}
                  </div>

                  {/* Title */}
                  <h3 className={`text-sm sm:text-base font-bold text-slate-900 mb-1.5 truncate group-hover:text-[#e31b88] transition-colors ${
                    isCancelled ? "line-through text-slate-600" : ""
                  }`}>
                    {booking.title}
                  </h3>

                  {/* Venue / City */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 truncate">
                    <BsGeoAlt className="text-slate-400 shrink-0" size={11} />
                    <span className="truncate">{booking.city}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div>
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-3.5 pt-2 border-t border-slate-100">
                    <span>Qty: {booking.quantity} {booking.ticket_name ? `(${booking.ticket_name})` : ""}</span>
                    <span className="font-bold text-slate-900">₹{booking.total_amount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                      Ref: {booking.booking_reference}
                    </span>

                    {isLive && booking.booking_status === "confirmed" ? (
                      <button
                        onClick={() => navigate(`/my-bookings/${booking.booking_id}`)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#fce7f3] group-hover:bg-[#e31b88] text-[#e31b88] group-hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        <BsTicketDetailed size={11} />
                        View Pass
                      </button>
                    ) : (
                      <Link
                        to={`/events/${booking.event_id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Event Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;