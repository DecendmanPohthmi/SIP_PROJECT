import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BsPeopleFill,
  BsCalendarEvent,
  BsArrowCounterclockwise,
  BsCashCoin,
  BsBroadcast,
  BsArrowRight,
  BsCashStack,
  BsPersonWorkspace,
  BsBank,
  BsArrowRepeat,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type Organiser = {
  organiser_id: number;
  full_name: string;
  organisation_name: string;
};

type EventItem = {
  event_id: number;
  title: string;
  event_date: string;
  city: string;
  organisation_name?: string;
  full_name?: string;
};

type EarningsData = {
  admin_total_balance: number;
  admin_withdrawn: number;
  organizer_total_balance: number;
  organizer_withdrawn: number;
};

const AdminDashboard = () => {
  const { token } = useAuth();

  const [pendingOrganisers, setPendingOrganisers] = useState<Organiser[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [pendingRefundsCount, setPendingRefundsCount] = useState<number>(0);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const authHeaders = { token: token || "" };

  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const [orgRes, pendingEventRes, liveEventRes, pendingRefundsRes, earningsRes] = await Promise.all([
        fetch(`${API}/api/admin/organisers/pending`, { headers: authHeaders }),
        fetch(`${API}/api/events/status/pending`, { headers: authHeaders }),
        fetch(`${API}/api/events/approved`, { headers: authHeaders }),
        fetch(`${API}/api/refunds/pending`, { headers: authHeaders }),
        fetch(`${API}/api/admin/`, { headers: authHeaders }),
      ]);

      const orgData = await orgRes.json();
      const pendingEventData = await pendingEventRes.json();
      const liveEventData = await liveEventRes.json();
      const pendingRefundsData = await pendingRefundsRes.json();
      const earningsData = await earningsRes.json();

      if (orgData.success) setPendingOrganisers(orgData.organisers || []);
      if (pendingEventData.success) setPendingEvents(pendingEventData.events || []);
      if (liveEventData.success) setLiveEvents(liveEventData.events || []);
      
      if (pendingRefundsData.success) {
        setPendingRefundsCount(
          typeof pendingRefundsData.total === "number"
            ? pendingRefundsData.total
            : pendingRefundsData.refunds?.length || 0
        );
      }

      if (earningsData.success) {
        setEarnings({
          admin_total_balance: Number(earningsData.admin_total_balance) || 0,
          admin_withdrawn: Number(earningsData.admin_withdrawn) || 0,
          organizer_total_balance: Number(earningsData.organizer_total_balance) || 0,
          organizer_withdrawn: Number(earningsData.organizer_withdrawn) || 0,
        });
      }
    } catch (err) {
      console.log("Dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadData(false);

    const intervalId = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token]);

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const totalEarnings = earnings ? earnings.admin_total_balance + earnings.organizer_total_balance : 0;

  return (
    <div className="w-full overflow-x-hidden space-y-6 sm:space-y-8">
      {/* Top Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Home</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            A quick look at what's happening across EventNest.
          </p>
        </div>
        <button
          onClick={() => loadData(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          <span className="hidden xs:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Alternative Layout: Hero Total Earnings Card First on Mobile / Full width */}
      <div className="bg-[#49557E] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
          <BsCashStack size={140} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-200 font-medium">Total Platform Earnings</p>
          <p className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {loading ? "..." : earnings !== null ? formatCurrency(totalEarnings) : "—"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/15">
          <div>
            <p className="text-[11px] text-indigo-200">Admin Balance</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 truncate">
              {loading ? "..." : earnings !== null ? formatCurrency(earnings.admin_total_balance) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-indigo-200">Organisers Balance</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 truncate">
              {loading ? "..." : earnings !== null ? formatCurrency(earnings.organizer_total_balance) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Breakdown Cards (Admin & Organiser split for mobile screens) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-base flex-shrink-0">
            <BsBank />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">Admin Share</p>
            <p className="text-sm sm:text-base font-bold text-[#49557E] truncate">
              {loading ? "..." : earnings !== null ? formatCurrency(earnings.admin_total_balance) : "—"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-base flex-shrink-0">
            <BsPersonWorkspace />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">Organiser Share</p>
            <p className="text-sm sm:text-base font-bold text-[#49557E] truncate">
              {loading ? "..." : earnings !== null ? formatCurrency(earnings.organizer_total_balance) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Needs Your Attention - Compact Horizontal Scroll/Grid Cards for Phone */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-800 mb-3">Needs Your Attention</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/organisers"
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hover:border-[#49557E]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#49557E] mb-2">
              <BsPeopleFill size={18} />
              <BsArrowRight size={14} className="text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{loading ? "..." : pendingOrganisers.length}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Organiser Requests</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hover:border-[#49557E]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#49557E] mb-2">
              <BsCalendarEvent size={18} />
              <BsArrowRight size={14} className="text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{loading ? "..." : pendingEvents.length}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Event Requests</p>
            </div>
          </Link>

          <Link
            to="/admin/refunds"
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hover:border-[#49557E]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#49557E] mb-2">
              <BsArrowCounterclockwise size={18} />
              <BsArrowRight size={14} className="text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{loading ? "..." : pendingRefundsCount}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Refund Requests</p>
            </div>
          </Link>

          <Link
            to="/admin/withdrawals"
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hover:border-[#49557E]/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#49557E] mb-2">
              <BsCashCoin size={18} />
              <BsArrowRight size={14} className="text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-400">—</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">Withdrawals</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Live Events Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <BsBroadcast className="text-[#49557E]" size={16} />
            Live Events
          </h2>
          <Link to="/admin/events" className="text-xs sm:text-sm text-[#49557E] font-semibold hover:underline">
            View All
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-xs sm:text-sm">Loading...</p>
        ) : liveEvents.length === 0 ? (
          <p className="text-slate-400 text-xs sm:text-sm">No events are currently live.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
            {liveEvents.slice(0, 4).map((event) => (
              <div
                key={event.event_id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 border-l-4 border-l-[#49557E]"
              >
                <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{event.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{event.event_date} · {event.city}</p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">by {event.organisation_name || event.full_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;