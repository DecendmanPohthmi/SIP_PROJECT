import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BsPlusLg,
  BsCalendar4Event,
  BsGeoAlt,
  BsPeople,
  BsPencilSquare,
  BsXCircle,
  BsBroadcast,
  BsCheckCircleFill,
  BsClockHistory,
  BsXCircleFill,
  BsChevronRight,
  BsTag,
  BsTrophyFill,
  BsExclamationTriangle,
  BsWallet2,
  BsArrowUpRightCircle,
  BsArrowDownLeftCircle,
} from "react-icons/bs";

type EventType = {
  event_id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  event_date: string;
  start_time: string;
  end_time: string;
  total_capacity: number;
  available_capacity: number;
  pricing_mode: "free" | "paid";
  ticket_price?: number;
  status: "pending" | "approved" | "live" | "rejected" | "completed" | "cancelled";
  image_url: string | null;
  rejection_reason?: string;
  total_revenue?: number;
  tickets_sold?: number;
};

type WalletType = {
  wallet_id: number;
  owner_type: string;
  owner_id: number;
  total_balance: number;
  withdrawn_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

type ModalType = "edit" | "cancel" | null;

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

export const OrganiserDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [events, setEvents] = useState<EventType[]>([]);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [topEvents, setTopEvents] = useState<EventType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State to manage confirmation modal popups
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // 1. Fetch ALL events, wallet, and top events once when token changes or on mount
  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
        token: token || "",
      };

      const [eventsRes, walletRes, topEventsRes] = await Promise.all([
        fetch(`${API}/api/events/my-events`, { headers }),
        fetch(`${API}/api/organiser/my-wallet`, { headers }),
        fetch(`${API}/api/events/top-events`, { headers }),
      ]);

      const eventsData = await eventsRes.json();
      const walletData = await walletRes.json();
      const topEventsData = await topEventsRes.json();

      if (!eventsData.success) {
        throw new Error(eventsData.message || "Failed to fetch events");
      }

      setEvents(eventsData.events || []);
      
      if (walletData.success) {
        setWallet(walletData.wallet || null);
      }

      if (topEventsData.success) {
        setTopEvents(topEventsData.events || []);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Stats calculated across events
  const stats = useMemo(() => {
    const total = events.length;
    const live = events.filter((e) => e.status === "live").length;
    const approved = events.filter((e) => e.status === "approved").length;
    const completed = events.filter((e) => e.status === "completed").length;

    // Use wallet total_balance as authoritative total revenue, or fallback to sum if wallet isn't loaded
    const totalRevenue = wallet ? Number(wallet.total_balance) + Number(wallet.withdrawn_amount) : 0;

    return { total, live, approved, completed, totalRevenue };
  }, [events, wallet]);

  // 3. Local filtering by tab
  const displayedEvents = useMemo(() => {
    if (activeTab === "all") return events;
    return events.filter((event) => event.status === activeTab);
  }, [events, activeTab]);

  // Allow click when event is live, completed, or cancelled
  const handleCardClick = (event: EventType) => {
    if (["live", "completed", "cancelled"].includes(event.status)) {
      navigate(`/organiser/event/${event.event_id}/attendees`);
    }
  };

  // Trigger Modal Popups
  const openModal = (e: React.MouseEvent, type: ModalType, event: EventType) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedEvent(null);
    setActionLoading(false);
  };

  // Execute Confirmed Actions
  const handleConfirmAction = async () => {
    if (!selectedEvent || !activeModal) return;

    if (activeModal === "edit") {
      navigate(`/organiser/edit-event/${selectedEvent.event_id}`);
      closeModal();
      return;
    }

    try {
      setActionLoading(true);
      if (activeModal === "cancel") {
        const res = await fetch(`${API}/api/events/cancel/${selectedEvent.event_id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            token: token || "",
          },
        });
        const data = await res.json();
        if (data.success) {
          fetchDashboardData();
        } else {
          alert(data.message || "Failed to cancel event.");
        }
      }
    } catch (err) {
      console.error(err);
      alert(`Error processing ${activeModal} request.`);
    } finally {
      closeModal();
    }
  };

  const renderStatusBadge = (status: EventType["status"]) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/90 backdrop-blur-md text-white shadow-lg shadow-red-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE NOW
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
            <BsCheckCircleFill size={11} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-md text-white shadow-sm">
            <BsClockHistory size={11} /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600/90 backdrop-blur-md text-white shadow-sm">
            <BsXCircleFill size={11} /> Rejected
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/80 backdrop-blur-md text-white">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/80 backdrop-blur-md text-white">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "all", label: "All Events" },
    { id: "live", label: "Live" },
    { id: "approved", label: "Approved" },
    { id: "pending", label: "Pending" },
    { id: "rejected", label: "Rejected" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header & CTA Banner */}
        <div className="relative bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/50 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-3 shadow-sm backdrop-blur-sm">
                Organiser Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Organiser Dashboard
              </h1>
              <p className="text-sm text-slate-300 mt-1 font-normal">
                Manage your events, configure ticket tiers, and track wallet earnings.
              </p>
            </div>

            <button
              onClick={() => navigate("/organiser/create-event")}
              className="inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c71575] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-pink-500/20 cursor-pointer"
            >
              <BsPlusLg size={16} />
              Create Event
            </button>
          </div>
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-50 text-[#e31b88] rounded-2xl">
              <BsCalendar4Event size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Created</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-50 text-[#e31b88] rounded-2xl">
              <BsBroadcast size={22} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Events</p>
              <h3 className="text-2xl font-black text-red-600">{stats.live}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-50 text-[#e31b88] rounded-2xl">
              <BsCheckCircleFill size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
              <h3 className="text-2xl font-black text-emerald-600">{stats.approved}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-pink-50 text-[#e31b88] rounded-2xl">
              <BsClockHistory size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-slate-800">{stats.completed}</h3>
            </div>
          </div>
        </div>

        {/* Wallet & Top 3 Performing Events Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-700/50 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Wallet Balance</span>
                <div className="p-2.5 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
                  <BsWallet2 size={18} />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 tracking-tight text-white">
                {wallet ? `${wallet.currency || 'INR'} ${Number(wallet.total_balance).toLocaleString()}` : "₹0.00"}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <BsArrowUpRightCircle size={10} className="text-emerald-400" /> Withdrawn
                  </p>
                  <p className="text-sm font-bold mt-0.5 text-white">
                    {wallet ? `${wallet.currency || 'INR'} ${Number(wallet.withdrawn_amount).toLocaleString()}` : "₹0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <BsArrowDownLeftCircle size={10} className="text-pink-400" /> Total Revenue
                  </p>
                  <p className="text-sm font-bold mt-0.5 text-white">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <span>Active Paid Events</span>
              <span className="font-bold text-white">
                {events.filter((e) => e.pricing_mode === "paid").length}
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-pink-50 text-[#e31b88] rounded-xl">
                  <BsTrophyFill size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Top 3 Most Earned Events</h3>
              </div>

              <div className="space-y-3">
                {topEvents.length > 0 ? (
                  topEvents.slice(0, 3).map((item, idx) => (
                    <div
                      key={item.event_id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pink-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-black ${
                          idx === 0 ? "bg-pink-100 text-[#e31b88]" :
                          idx === 1 ? "bg-slate-200 text-slate-700" :
                          "bg-slate-200 text-slate-600"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-500">{item.tickets_sold || 0} Tickets Sold • {item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-emerald-600">
                          ₹{Number(item.total_revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center">No earnings data available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event List Section */}
        <div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#e31b88] text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200/80 p-4 rounded-2xl text-sm mb-6 flex items-center gap-2">
              <BsXCircleFill className="shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/80 rounded-3xl h-80 animate-pulse p-5 flex flex-col justify-between"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded-xl mt-auto" />
                </div>
              ))}
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 sm:p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-pink-50 text-[#e31b88] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BsCalendar4Event size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No events found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                There are currently no events matching the <span className="font-semibold text-slate-700">"{activeTab}"</span> filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event) => {
                const isClickable = ["live", "completed", "cancelled"].includes(event.status);

                return (
                  <div
                    key={event.event_id}
                    onClick={() => handleCardClick(event)}
                    className={`group bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between ${
                      isClickable
                        ? "cursor-pointer hover:border-pink-200 hover:shadow-xl hover:-translate-y-1"
                        : "cursor-default"
                    }`}
                  >
                    <div>
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              isClickable ? "group-hover:scale-105" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100/70">
                            <BsCalendar4Event size={36} />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                        <div className="absolute top-3 right-3">
                          {renderStatusBadge(event.status)}
                        </div>

                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 shadow-sm">
                            <BsTag size={10} className="text-[#e31b88]" />
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2">
                          <h2
                            className={`text-base font-bold text-slate-900 transition-colors line-clamp-1 ${
                              isClickable ? "group-hover:text-[#e31b88]" : ""
                            }`}
                          >
                            {event.title}
                          </h2>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              event.pricing_mode === "free"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-pink-50 text-[#e31b88] border border-pink-100"
                            }`}
                          >
                            {event.pricing_mode}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-2 text-slate-700">
                            <BsCalendar4Event className="text-[#e31b88] shrink-0" size={13} />
                            <span className="line-clamp-1">
                              {event.event_date
                                ? new Date(event.event_date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "TBD"}{" "}
                              • {event.start_time}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600">
                            <BsGeoAlt className="text-slate-400 shrink-0" size={13} />
                            <span className="line-clamp-1">
                              {event.venue}, {event.city}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600">
                            <BsPeople className="text-slate-400 shrink-0" size={13} />
                            <span>
                              Seats:{" "}
                              <strong className="text-slate-900">
                                {event.available_capacity ?? event.total_capacity}
                              </strong>{" "}
                              / {event.total_capacity} remaining
                            </span>
                          </div>
                        </div>

                        {event.status === "rejected" && event.rejection_reason && (
                          <div className="mt-3 p-3 bg-rose-50/80 border border-rose-200/60 rounded-2xl text-xs text-rose-800">
                            <span className="font-semibold">Rejection Reason:</span>{" "}
                            {event.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.status === "approved" && (
                        <div className="w-full flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/organiser/events/${event.event_id}/tickets`)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c71575] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-pink-500/20 cursor-pointer"
                          >
                            <BsBroadcast size={14} /> Go Live
                          </button>
                          <button
                            onClick={(e) => openModal(e, "edit", event)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200/85 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsPencilSquare size={12} /> Edit
                          </button>
                          <button
                            onClick={(e) => openModal(e, "cancel", event)}
                            className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsXCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}

                      {event.status === "live" && (
                        <div className="w-full flex gap-2">
                          <button
                            onClick={() => navigate(`/organiser/event/${event.event_id}/attendees`)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c71575] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-pink-500/20 cursor-pointer"
                          >
                            <BsBroadcast className="animate-pulse" size={14} />
                            Check-In
                            <BsChevronRight size={10} />
                          </button>
                          <button
                            onClick={(e) => openModal(e, "cancel", event)}
                            className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsXCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}

                      {event.status === "pending" && (
                        <div className="flex items-center gap-2 w-full justify-end">
                          <button
                            onClick={(e) => openModal(e, "edit", event)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsPencilSquare size={12} /> Edit
                          </button>
                          <button
                            onClick={(e) => openModal(e, "cancel", event)}
                            className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsXCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}

                      {event.status === "rejected" && (
                        <div className="flex items-center gap-2 w-full justify-end">
                          <button
                            onClick={(e) => openModal(e, "edit", event)}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
                          >
                            <BsPencilSquare size={12} /> Edit & Re-submit
                          </button>
                        </div>
                      )}

                      {(event.status === "completed" || event.status === "cancelled") && (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">Archived Event</span>
                          <button
                            onClick={() => navigate(`/organiser/event/${event.event_id}/attendees`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            <BsPeople size={13} />
                            Attendees
                            <BsChevronRight size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal Popup */}
      {activeModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <BsExclamationTriangle size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeModal === "edit" && "Confirm Edit"}
                {activeModal === "cancel" && "Confirm Cancellation"}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeModal === "edit" && (
                <>
                  Are you sure you want to edit <strong className="text-slate-900">"{selectedEvent.title}"</strong>? Any pending review details may require re-approval.
                </>
              )}
              {activeModal === "cancel" && (
                <>
                  Are you sure you want to cancel <strong className="text-slate-900">"{selectedEvent.title}"</strong>? This will mark the event status as cancelled.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer ${
                  activeModal === "edit"
                    ? "bg-[#e31b88] hover:bg-[#c71575]"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Yes, Proceed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganiserDashboard;