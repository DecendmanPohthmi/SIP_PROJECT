import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BsPeople,
  BsCalendarCheck,
  BsArrowRight,
  BsShieldCheck,
  BsHourglassSplit,
  BsArrowRepeat,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const AdminHome = () => {
  const { token } = useAuth();
  const [pendingOrganisersCount, setPendingOrganisersCount] = useState<number | string>("—");
  const [pendingEventsCount, setPendingEventsCount] = useState<number | string>("—");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const authHeaders = { token: token || "" };

  const fetchCounts = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const [orgRes, eventRes] = await Promise.all([
        fetch(`${API}/api/admin/organisers/pending`, { headers: authHeaders }),
        fetch(`${API}/api/events/status/pending`, { headers: authHeaders }),
      ]);

      const orgData = await orgRes.json();
      const eventData = await eventRes.json();

      if (orgData.success) {
        setPendingOrganisersCount(orgData.organisers?.length || 0);
      }

      if (eventData.success) {
        setPendingEventsCount(eventData.events?.length || 0);
      }
    } catch (err) {
      console.log("Failed to load admin home counts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchCounts(false);

    // Auto-update every 30 seconds
    const intervalId = setInterval(() => {
      fetchCounts(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token, fetchCounts]);

  return (
    <div className="w-full overflow-x-hidden p-4 sm:p-6 bg-slate-50/50 min-h-screen space-y-6 sm:space-y-8">
      {/* Top Header & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Control</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Keep EventNest safe and trustworthy.
          </p>
        </div>
        <button
          onClick={() => fetchCounts(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          <span className="hidden xs:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white rounded-2xl overflow-hidden shadow-lg border border-indigo-950/40 p-5 sm:p-8 md:p-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

        <div className="relative z-10">
          <span className="bg-white/10 text-indigo-200 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 inline-flex items-center gap-1.5">
            <BsShieldCheck size={13} />
            Control Room
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-tight tracking-tight">
            Keep EventNest Trustworthy
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
            Every organiser and every event passes through you before it
            reaches the public. Here's what's waiting on your review.
          </p>
        </div>
      </div>

      {/* Pending overview cards (Stacked well for mobile screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/admin/organisers"
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-[#49557E]/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
              <BsPeople />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                {loading ? "..." : pendingOrganisersCount}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">Organisers awaiting review</p>
            </div>
          </div>
          <BsArrowRight className="text-slate-300 flex-shrink-0 ml-2" size={18} />
        </Link>

        <Link
          to="/admin/events"
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-[#49557E]/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
              <BsCalendarCheck />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                {loading ? "..." : pendingEventsCount}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">Events awaiting review</p>
            </div>
          </div>
          <BsArrowRight className="text-slate-300 flex-shrink-0 ml-2" size={18} />
        </Link>
      </div>

      {/* Guidance Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <BsHourglassSplit size={16} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">How review works</h3>
        </div>
        <ol className="text-xs sm:text-sm text-slate-500 leading-relaxed space-y-2 list-decimal list-inside pl-1">
          <li>New organisers register and sit as pending until you approve them.</li>
          <li>Approved organisers can submit events, which also start pending.</li>
          <li>Rejecting either asks for a reason, which is shown to the applicant.</li>
        </ol>
        <div className="mt-5 sm:mt-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-[#49557E] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-full hover:bg-[#3c4768] transition-colors shadow-sm active:scale-95"
          >
            Go to Dashboard
            <BsArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;