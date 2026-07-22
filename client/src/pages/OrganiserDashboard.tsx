import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BsCalendarEvent,
  BsCashStack,
  BsTicketPerforated,
  BsPeopleFill,
  BsPlusCircle,
  BsPencilSquare,
  BsClockHistory,
  BsBroadcast,
  BsCheckCircleFill,
  BsXCircleFill,
  BsPatchCheckFill,
  BsRocketTakeoff,
  BsSlashCircle,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type EventItem = {
  event_id: number;
  title: string;
  event_date: string;
  venue: string;
  city: string;
  status: string;
  total_capacity: number;
  available_capacity: number;
};

type Tab = "approved" | "live" | "pending" | "completed" | "rejected" | "cancelled";

const OrganiserDashboard = () => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactElement; iconColor: string }[] = [
    { key: "live", label: "Live", icon: <BsBroadcast size={16} />, iconColor: "text-emerald-500" },
    { key: "approved", label: "Approved", icon: <BsPatchCheckFill size={16} />, iconColor: "text-sky-500" },
    { key: "pending", label: "Pending Approval", icon: <BsClockHistory size={16} />, iconColor: "text-slate-500" },
    { key: "completed", label: "Completed", icon: <BsCheckCircleFill size={16} />, iconColor: "text-indigo-500" },
    { key: "rejected", label: "Rejected", icon: <BsXCircleFill size={16} />, iconColor: "text-red-500" },
    { key: "cancelled", label: "Cancelled", icon: <BsSlashCircle size={16} />, iconColor: "text-red-500" },
  ];

  const fetchAll = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/events/my-events", {
        headers: { token: token || "" },
      });
      const data = await res.json();
      if (data.success) setAllEvents(data.events || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchByStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:4000/api/events/my-events/status/${activeTab}`,
        { headers: { token: token || "" } }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Could not load events");
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  useEffect(() => {
    if (token) fetchByStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const refreshAll = () => {
    fetchAll();
    fetchByStatus();
  };

  const handlePublish = async (eventId: number) => {
    try {
      setActionLoadingId(eventId);
      const res = await fetch(`http://localhost:4000/api/events/publish/${eventId}`, {
        method: "PUT",
        headers: { token: token || "" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      refreshAll();
    } catch (err: any) {
      alert(err.message || "Could not publish event.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (eventId: number) => {
    if (!confirm("Cancel this live event? This cannot be undone.")) return;

    try {
      setActionLoadingId(eventId);
      const res = await fetch(`http://localhost:4000/api/events/cancel/${eventId}`, {
        method: "PUT",
        headers: { token: token || "" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      refreshAll();
    } catch (err: any) {
      alert(err.message || "Could not cancel event.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (eventId: number) => {
    if (!confirm("Mark this event as completed? This cannot be undone.")) return;

    try {
      setActionLoadingId(eventId);
      const res = await fetch(`http://localhost:4000/api/events/complete/${eventId}`, {
        method: "PUT",
        headers: { token: token || "" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      refreshAll();
    } catch (err: any) {
      alert(err.message || "Could not mark event as completed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const countByStatus = (status: Tab) =>
    allEvents.filter((e) => e.status === status).length;

  const totalEvents = allEvents.length;
  const ticketsSold = allEvents.reduce(
    (sum, e) => sum + (e.total_capacity - e.available_capacity),
    0
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 mt-1">Here's how your events are performing.</p>
        </div>

        <Link
          to="/organiser/create-event"
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800"
        >
          <BsPlusCircle size={16} />
          Create Event
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <BsCalendarEvent />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalEvents}</p>
            <p className="text-sm text-slate-500">Total Events</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <BsCashStack />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">—</p>
            <p className="text-sm text-slate-500">Total Earnings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <BsTicketPerforated />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{ticketsSold}</p>
            <p className="text-sm text-slate-500">Tickets Sold</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <BsPeopleFill />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">—</p>
            <p className="text-sm text-slate-500">Attendees Reached</p>
          </div>
        </div>

      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-black text-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={tab.iconColor}>{tab.icon}</span>
            {tab.label}
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {countByStatus(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Approved tab helper note */}
      {activeTab === "approved" && events.length > 0 && (
        <div className="bg-sky-50 border border-sky-100 text-sky-700 text-sm rounded-xl px-4 py-3 mb-4">
          These events are approved but not visible to attendees yet. Add ticket types and publish to go live.
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading events...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No {activeTab} events yet.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 flex items-center justify-center text-white">
                  <BsCalendarEvent size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {event.event_date} · {event.venue}, {event.city}
                  </p>
                  <p className="text-sm text-slate-400">
                    {event.total_capacity - event.available_capacity} / {event.total_capacity} tickets sold
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                  {event.status}
                </span>

                <div className="flex gap-2">
                  {event.status === "approved" && (
                    <>
                      <Link
                        to={`/organiser/events/${event.event_id}/tickets`}
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        <BsTicketPerforated size={14} />
                        Tickets
                      </Link>
                      <button
                        onClick={() => handlePublish(event.event_id)}
                        disabled={actionLoadingId === event.event_id}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <BsRocketTakeoff size={14} />
                        {actionLoadingId === event.event_id ? "..." : "Publish"}
                      </button>
                    </>
                  )}

                  {event.status === "live" && (
                    <>
                      <button
                        onClick={() => handleComplete(event.event_id)}
                        disabled={actionLoadingId === event.event_id}
                        className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 disabled:opacity-50"
                      >
                        <BsCheckCircleFill size={14} />
                        {actionLoadingId === event.event_id ? "..." : "Mark Completed"}
                      </button>
                      <button
                        onClick={() => handleCancel(event.event_id)}
                        disabled={actionLoadingId === event.event_id}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        <BsSlashCircle size={14} />
                        {actionLoadingId === event.event_id ? "..." : "Cancel"}
                      </button>
                    </>
                  )}

                  <Link
                    to={`/organiser/edit-event/${event.event_id}`}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  >
                    <BsPencilSquare size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrganiserDashboard;