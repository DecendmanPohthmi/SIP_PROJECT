import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaBolt,
  FaTicketAlt,
  FaLock,
} from "react-icons/fa";
import { BsTicketPerforated } from "react-icons/bs";

const Home = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:4000/api/events/approved");
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load events");
        }

        setEvents(data.events || []);
      } catch (err) {
        console.log(err);
        setError("Something went wrong while loading events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <div className="relative m-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white rounded-2xl overflow-hidden shadow-lg border border-indigo-950/40">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent"></div>

        <div className="relative p-8 md:p-14 text-center flex flex-col items-center z-10">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-md shadow-rose-900/30">
            Your City, Your Events
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight drop-shadow-md">
            Every Event Worth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">
              Showing Up For
            </span>
          </h1>
          <p className="text-indigo-200 text-base md:text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
            From live concerts to weekend workshops, find what's happening near
            you and lock in your ticket in seconds.
          </p>
        </div>
      </div>

      {/* Why Choose Us / Features row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-6 mb-14">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-amber-500 text-white shadow-amber-200">
            <FaBolt />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Book in Seconds
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            No long forms, no waiting rooms. Pick your event, confirm, and
            you're in.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-indigo-600 text-white shadow-indigo-200">
            <BsTicketPerforated />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Tickets On Hand
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every booking lands straight in your dashboard — no digging through
            emails.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-emerald-500 text-white shadow-emerald-200">
            <FaLock />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Verified Organisers
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every host is reviewed before their event goes live, so you know
            it's legit.
          </p>
        </div>
      </div>

      {/* Event List Header */}
      <div className="flex items-center justify-between mx-6 mb-6 border-b border-slate-200 pb-3">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Happening Soon
        </h2>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
          {loading
            ? "..."
            : `${events.length} result${events.length !== 1 ? "s" : ""} found`}
        </div>
      </div>

      {/* Events Handling Placeholder */}
      {loading ? (
        <div className="text-center py-16 mx-6 text-lg text-slate-500">
          Loading events...
        </div>
      ) : error ? (
        <div className="text-center py-16 mx-6 text-lg text-red-500">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 mx-6 text-lg text-slate-500">
          No events have been added yet. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 mb-14">
          {events.map((event) => (
            <Link
              key={event.event_id}
              to={`/events/${event.event_id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              {event.image_url ? (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 flex items-center justify-center text-white">
                  <FaCalendarAlt size={32} className="opacity-70" />
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
                  {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5">
                  <FaCalendarAlt size={13} />
                  <span>{event.event_date}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FaMapMarkerAlt size={13} />
                  <span className="truncate">{event.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Section */}
      <footer className="mt-auto pt-12 pb-8 border-t border-slate-200 text-center">
        <div className="flex justify-center items-center gap-2 mb-3">
          <FaTicketAlt className="text-indigo-600 text-xl" />
          <span className="text-lg font-extrabold text-slate-800 tracking-tight">
            EventNest
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto leading-relaxed">
          Built for people who'd rather be at the event than searching for it.
          Discover, book, and go.
        </p>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          &copy; 2026 EventNest. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
