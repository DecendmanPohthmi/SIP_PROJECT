import React from "react";
import { Link } from "react-router-dom";
import {
  BsTicketDetailed,
  BsCalendarCheck,
  BsBagCheck,
  BsClockHistory,
  BsCalendarEvent,
  BsGeoAlt,
} from "react-icons/bs";

const UserDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Dashboard</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your events.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <BsBagCheck />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">12</p>
            <p className="text-sm text-slate-500">Total Bookings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <BsCalendarCheck />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">3</p>
            <p className="text-sm text-slate-500">Upcoming Events</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl">
            <BsClockHistory />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">9</p>
            <p className="text-sm text-slate-500">Past Events</p>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Upcoming Bookings</h2>
        <Link to="/myBooking" className="text-sm text-indigo-600 font-semibold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Link
          to="/events/1"
          className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              Confirmed
            </span>
            <BsTicketDetailed className="text-slate-300" size={18} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
            Tech Conference 2026
          </h3>

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5">
            <BsCalendarEvent size={13} />
            <span>15 August 2026</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BsGeoAlt size={13} />
            <span className="truncate">Convention Hall, Shillong</span>
          </div>
        </Link>

        <Link
          to="/events/2"
          className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              Confirmed
            </span>
            <BsTicketDetailed className="text-slate-300" size={18} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
            Music Festival
          </h3>

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5">
            <BsCalendarEvent size={13} />
            <span>20 October 2026</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BsGeoAlt size={13} />
            <span className="truncate">Shillong Stadium, Shillong</span>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default UserDashboard;