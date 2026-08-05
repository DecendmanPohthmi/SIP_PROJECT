import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBolt,
  FaTicketAlt,
  FaLock,
  FaSearch,
} from "react-icons/fa";
import { BsTicketPerforated } from "react-icons/bs";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "";
  let cleanTime = timeStr;
  if (timeStr.includes("T")) {
    cleanTime = timeStr.split("T")[1];
  }
  cleanTime = cleanTime.split("+")[0].split("Z")[0];
  const [h, m] = cleanTime.split(":");
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return timeStr;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m || "00"} ${suffix}`;
};

export const Home = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [, setTick] = useState(0); // Used to force periodic re-renders for time filtering

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API}/api/events/approved`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load events");
        }

        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Periodic trigger every 30 minutes to re-evaluate active time filters without refreshing the page
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      event.title?.toLowerCase().includes(query) ||
      event.city?.toLowerCase().includes(query) ||
      event.venue?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query);

    // Hide events that are past or within 30 minutes of their end time
    if (event.event_date && event.end_time) {
      const eventEndDateTime = new Date(`${event.event_date}T${event.end_time}`);
      const hideThreshold = new Date(eventEndDateTime.getTime() - 30 * 60 * 1000);
      const now = new Date();

      if (now >= hideThreshold) {
        return false;
      }
    }

    if (selectedTab === "free") {
      return matchesSearch && event.pricing_mode === "free";
    }
    if (selectedTab === "paid") {
      return matchesSearch && event.pricing_mode !== "free";
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-20">
      {/* Hero Section */}
      <div className="relative mx-4 sm:mx-8 mt-6 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-14 md:p-16 text-center flex flex-col items-center z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-4 shadow-sm backdrop-blur-sm">
            Your City, Your Events
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 leading-tight tracking-tight text-white">
            Every Event Worth <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">
              Showing Up For
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            From live concerts to weekend workshops, find what's happening near
            you and lock in your ticket in seconds.
          </p>
        </div>
      </div>

      {/* Why Choose Us / Features row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mx-4 sm:mx-8 my-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <FaBolt />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Book in Seconds</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            No long forms, no waiting rooms. Pick your event, confirm, and you're in.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <BsTicketPerforated />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Tickets On Hand</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Every booking lands straight in your dashboard — no digging through emails.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200 sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <FaLock />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Verified Organisers</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Every host is reviewed before their event goes live, so you know it's legit.
          </p>
        </div>
      </div>

      {/* Filter Pills & Search Bar Section */}
      <div className="mx-4 sm:mx-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "all"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Events ({filteredEvents.length})
          </button>
          <button
            onClick={() => setSelectedTab("free")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "free"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Free Events
          </button>
          <button
            onClick={() => setSelectedTab("paid")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              selectedTab === "paid"
                ? "bg-[#e31b88] text-white shadow-pink-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Paid Events
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FaSearch
            size={13}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, location, etc..."
            className="w-full pl-11 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-20 mx-4 sm:mx-8 text-sm sm:text-base text-slate-500 font-medium">
          Loading events...
        </div>
      ) : error ? (
        <div className="text-center py-20 mx-4 sm:mx-8 text-sm sm:text-base text-rose-500 font-medium">
          {error}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 mx-4 sm:mx-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md mx-auto">
          <p className="text-slate-800 font-bold mb-1">No upcoming events found matching your search.</p>
          <p className="text-slate-400 text-xs mb-4">Try checking your spelling or searching for a different keyword.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-4 sm:mx-8 mb-12">
          {filteredEvents.map((event) => {
            const initialCapacity = event.total_capacity || 100;
            const available = event.available_capacity ?? initialCapacity;
            const soldCount = initialCapacity - available;
            const soldPercentage = Math.min(
              100,
              Math.max(0, Math.round((soldCount / initialCapacity) * 100))
            );

            return (
              <Link
                key={event.event_id}
                to={`/events/${event.event_id}`}
                className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-white">
                        <FaCalendarAlt size={28} className="opacity-70" />
                      </div>
                    )}

                    {/* Category badge */}
                    {event.category && (
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        {event.category}
                      </span>
                    )}

                    {/* Active status badge */}
                    <span className="absolute top-2.5 right-2.5 bg-pink-500/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="text-[11px] font-medium text-slate-400 mb-1">
                    {formatDateOnly(event.event_date)}
                    {event.start_time && ` • ${formatTime(event.start_time)}`}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 truncate group-hover:text-[#e31b88] transition-colors">
                    {event.title}
                  </h3>

                  {/* Venue / City */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 truncate">
                    <FaMapMarkerAlt className="text-slate-400 shrink-0" size={11} />
                    <span className="truncate">
                      {event.venue ? `${event.venue}, ` : ""}
                      {event.city}
                    </span>
                  </div>
                </div>

                {/* Progress bar and Price Footer */}
                <div>
                  <div className="space-y-1.5 mb-3.5">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#e31b88] h-full rounded-full transition-all duration-500"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                      <span>{soldPercentage}%</span>
                      <span>
                        {available === 0 ? (
                          <span className="text-rose-500 font-bold">Sold out</span>
                        ) : (
                          `${available} left`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {event.pricing_mode === "free" ? (
                        <span className="text-emerald-600 font-bold">Free</span>
                      ) : (
                        <span className="text-[#49557E] font-bold">Paid</span>
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#fce7f3] group-hover:bg-[#e31b88] text-[#e31b88] group-hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                      <FaTicketAlt size={10} />
                      View
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;