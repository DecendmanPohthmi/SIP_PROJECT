import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BsCalendarEvent,
  BsTrophy,
  BsGeoAlt,
  BsPersonWorkspace,
  BsSearch,
  BsTicketPerforated,
  BsCashStack,
  BsBroadcast,
  BsBuilding,
  BsTags,
  BsCheckCircle,
  BsXCircle,
  BsCheck2All,
  BsSlashCircle,
  BsArrowRepeat,
} from "react-icons/bs";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type EventItem = {
  event_id: number;
  title: string;
  organiser_name: string;
  organisation_name: string;
  category: string;
  city: string;
  venue: string;
  event_date: string;
  status: "pending" | "approved" | "live" | "completed" | "rejected" | "cancelled";
  tickets_sold: number;
  total_capacity: number;
  revenue: number;
};

const AdminEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "live" | "completed" | "rejected" | "cancelled"
  >("all");

  // State for Confirmation Modal (Approve, Complete, Cancel)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    eventId: number | null;
    action: "approve" | "complete" | "cancel" | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    action: null,
    eventTitle: "",
  });

  // State for Reject Reason Modal
  const [rejectingEventId, setRejectingEventId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchEvents = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/api/events`, getAuthHeader());
      
      const rawEvents = Array.isArray(response.data) ? response.data : response.data.events || [];

      const fetchedData: EventItem[] = rawEvents.map((e: any) => ({
        event_id: e.event_id,
        title: e.title,
        organiser_name: e.full_name || e.organiser_name || "Unknown Organiser",
        organisation_name: e.organisation_name || "Independent",
        category: e.category_name || e.category || "General",
        city: e.city,
        venue: e.venue,
        event_date: e.event_date,
        status: e.status,
        tickets_sold: Number(e.tickets_sold || 0),
        total_capacity: Number(e.total_capacity || 0),
        revenue: Number(e.revenue || 0),
      }));

      setEvents(fetchedData);
    } catch (err: any) {
      console.error("Failed to fetch admin events:", err);
      setError(err.response?.data?.message || "Failed to load events list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(false);

    // Auto update/refresh data every 30 seconds in the background
    const intervalId = setInterval(() => {
      fetchEvents(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  const handleStatusUpdate = async (
    eventId: number,
    action: "approve" | "reject" | "complete" | "cancel",
    payload: object = {}
  ) => {
    try {
      setActionLoadingId(eventId);
      const endpoint = `${API_BASE}/api/events/${action}/${eventId}`;

      await axios.put(endpoint, payload, getAuthHeader());
      await fetchEvents(true);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} event.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Trigger Action Confirm Modal
  const openConfirmModal = (
    eventId: number,
    action: "approve" | "complete" | "cancel",
    eventTitle: string
  ) => {
    setConfirmModal({
      isOpen: true,
      eventId,
      action,
      eventTitle,
    });
  };

  const handleExecuteConfirm = () => {
    if (confirmModal.eventId && confirmModal.action) {
      handleStatusUpdate(confirmModal.eventId, confirmModal.action);
    }
    setConfirmModal({ isOpen: false, eventId: null, action: null, eventTitle: "" });
  };

  // Trigger Reject Modal
  const openRejectModal = (eventId: number) => {
    setRejectingEventId(eventId);
    setRejectReason("");
    setRejectError("");
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Please enter a reason for rejecting this event.");
      return;
    }

    if (rejectingEventId !== null) {
      handleStatusUpdate(rejectingEventId, "reject", { reject_reason: rejectReason.trim() });
      setRejectingEventId(null);
      setRejectReason("");
      setRejectError("");
    }
  };

  const topEvents = [...events]
    .filter((e) => e.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const organisationTotals = events.reduce<Record<string, number>>((acc, e) => {
    if (e.organisation_name) {
      acc[e.organisation_name] = (acc[e.organisation_name] || 0) + e.revenue;
    }
    return acc;
  }, {});

  const topOrganisations = Object.entries(organisationTotals)
    .filter(([, revenue]) => revenue > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categoryTotals = events.reduce<Record<string, number>>((acc, e) => {
    if (e.category) {
      acc[e.category] = (acc[e.category] || 0) + e.revenue;
    }
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .filter(([, revenue]) => revenue > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organisation_name.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const liveCount = events.filter((e) => e.status === "live").length;
  const pendingCount = events.filter((e) => e.status === "pending").length;
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge = (status: EventItem["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-sky-50 text-sky-700 border border-sky-200",
      live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      completed: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      rejected: "bg-red-50 text-red-600 border border-red-200",
      cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
    };
    return (
      <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const statusFilters: { key: typeof statusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "Live" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const RankedBarList = ({ data }: { data: [string, number][] }) => {
    const maxValue = data[0]?.[1] || 1;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No earnings recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {data.map(([name, revenue], index) => (
              <div key={name} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    index === 0 ? "bg-[#49557E] text-white" : "bg-[#49557E]/10 text-[#49557E]"
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-800 truncate pr-2">{name}</p>
                    <p className="text-xs font-semibold text-[#49557E] shrink-0">
                      {formatCurrency(revenue)}
                    </p>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#49557E] rounded-full transition-all duration-500"
                      style={{ width: `${(revenue / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#49557E] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading events dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Top Header Section */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Events Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Overview of system performance, approvals, and event statuses.
          </p>
        </div>
        <button
          onClick={() => fetchEvents(false)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          {refreshing ? "Updating..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold underline">Dismiss</button>
        </div>
      )}

      {/* Hero Stats Card First (Phone Friendly Layout) */}
      <div className="bg-[#49557E] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between mb-6">
        <div className="absolute -right-4 -bottom-4 opacity-10 text-white pointer-events-none">
          <BsCashStack size={140} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-200 font-medium">Total Events Revenue</p>
          <p className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/15">
          <div>
            <p className="text-[11px] text-indigo-200">Total Events</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 truncate">{events.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-indigo-200">Live Now</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 truncate">{liveCount}</p>
          </div>
          <div>
            <p className="text-[11px] text-indigo-200">Pending</p>
            <p className="text-base sm:text-lg font-bold mt-0.5 truncate">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Compact Secondary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#49557E] text-white flex items-center justify-center text-base flex-shrink-0">
            <BsCalendarEvent />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-[#49557E] truncate">{events.length}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Total</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-base flex-shrink-0">
            <BsBroadcast />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-800 truncate">{liveCount}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Live Now</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-base flex-shrink-0">
            <BsTicketPerforated />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-800 truncate">{pendingCount}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Pending</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-base flex-shrink-0">
            <BsCashStack />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-slate-800 truncate">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">Revenue</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <BsTrophy className="text-[#49557E]" size={17} />
          Top Performing Events
        </h2>

        {topEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm">
            No events with sales recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topEvents.map((event, index) => (
              <div
                key={event.event_id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`absolute top-4 right-4 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    index === 0 ? "bg-[#49557E] text-white" : "bg-[#49557E]/10 text-[#49557E]"
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="w-11 h-11 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-lg mb-3">
                  <BsCalendarEvent />
                </div>

                <p className="font-semibold text-slate-800 text-sm truncate pr-6">{event.title}</p>
                <p className="text-xs text-slate-400 truncate mb-3">{event.organisation_name}</p>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <BsTicketPerforated size={13} className="text-[#49557E]" />
                    {event.tickets_sold}
                  </span>
                  <span className="text-xs font-semibold text-[#49557E]">
                    {formatCurrency(event.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BsBuilding className="text-[#49557E]" size={17} />
            Top Organisations by Revenue
          </h2>
          <RankedBarList data={topOrganisations} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BsTags className="text-[#49557E]" size={17} />
            Top Categories by Revenue
          </h2>
          <RankedBarList data={topCategories} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BsCalendarEvent className="text-[#49557E]" size={17} />
          All Events
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 overflow-x-auto max-w-full">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  statusFilter === f.key
                    ? "bg-white text-[#49557E] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <BsSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organiser..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-slate-200 focus:outline-none focus:border-[#49557E] transition-colors bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Organiser</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Tickets</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    No events match your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.event_id}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#49557E]/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#49557E]/15 text-[#49557E] flex items-center justify-center shrink-0">
                          <BsCalendarEvent size={14} />
                        </div>
                        <div>
                          <span className="font-medium text-slate-800 block">{event.title}</span>
                          <span className="text-[11px] text-slate-400">{event.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5 mb-0.5 text-xs">
                        <BsPersonWorkspace size={11} className="text-slate-400" />
                        {event.organisation_name}
                      </div>
                      <p className="text-xs text-slate-400 ml-4">{event.organiser_name}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        <BsGeoAlt size={11} className="text-slate-400" />
                        {event.city}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(event.event_date)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 bg-[#49557E]/10 text-[#49557E] text-xs font-semibold px-2.5 py-1 rounded-full">
                        {event.tickets_sold}/{event.total_capacity}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {event.revenue > 0 ? formatCurrency(event.revenue) : "—"}
                    </td>
                    <td className="px-5 py-3">{statusBadge(event.status)}</td>

                    <td className="px-5 py-3 text-right">
                      {actionLoadingId === event.event_id ? (
                        <span className="text-xs text-slate-400 animate-pulse">Updating...</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {event.status === "pending" && (
                            <>
                              <button
                                onClick={() => openConfirmModal(event.event_id, "approve", event.title)}
                                title="Approve Event"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              >
                                <BsCheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => openRejectModal(event.event_id)}
                                title="Reject Event"
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <BsXCircle size={15} />
                              </button>
                            </>
                          )}

                          {event.status === "live" && (
                            <>
                              <button
                                onClick={() => openConfirmModal(event.event_id, "complete", event.title)}
                                title="Mark Complete"
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              >
                                <BsCheck2All size={15} />
                              </button>
                              <button
                                onClick={() => openConfirmModal(event.event_id, "cancel", event.title)}
                                title="Cancel Event"
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                              >
                                <BsSlashCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Custom Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-800 mb-1 capitalize">
              {confirmModal.action} Event
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to {confirmModal.action}{" "}
              <span className="font-semibold text-slate-700">"{confirmModal.eventTitle}"</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmModal({ isOpen: false, eventId: null, action: null, eventTitle: "" })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirm}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors ${
                  confirmModal.action === "cancel"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-[#49557E] hover:bg-[#3b4566]"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom Reject Reason Modal */}
      {rejectingEventId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-800 mb-1">Reject Event</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please state the reason for rejecting this event request.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError("");
              }}
              placeholder="Enter rejection reason..."
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] resize-none h-28 mb-2"
            />

            {rejectError && (
              <p className="text-xs text-red-500 mb-3 font-medium">{rejectError}</p>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                onClick={() => {
                  setRejectingEventId(null);
                  setRejectReason("");
                  setRejectError("");
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;