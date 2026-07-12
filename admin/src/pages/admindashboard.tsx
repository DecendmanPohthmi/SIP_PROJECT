import React, { useState, useEffect } from "react";
import {
  BsPeopleFill,
  BsCalendarEvent,
  BsCheckCircle,
  BsXCircle,
  BsListUl,
  BsCashStack,
  BsGraphUpArrow,
  BsPersonWorkspace,
  BsX,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type Organiser = {
  organiser_id: number;
  full_name: string;
  organisation_name: string;
  email: string;
  phone: string;
};

type EventItem = {
  event_id: number;
  title: string;
  event_date: string;
  venue: string;
  city: string;
  status: string;
  full_name: string;
  organisation_name: string;
};

type Tab = "organisers" | "pendingEvents" | "allEvents";

type ConfirmTarget = {
  action: "approve" | "reject";
  type: "organiser" | "event";
  id: number;
  name: string;
} | null;

const AdminDashboard = () => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("organisers");
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const authHeaders = { token: token || "" };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "organisers") {
        const res = await fetch("http://localhost:4000/api/admin/organisers/pending", {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setOrganisers(data.organisers || []);
      }

      if (activeTab === "pendingEvents") {
        const res = await fetch("http://localhost:4000/api/events/status/pending", {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setPendingEvents(data.events || []);
      }

      if (activeTab === "allEvents") {
        const res = await fetch("http://localhost:4000/api/events/", {
          headers: authHeaders,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setAllEvents(data.events || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  // Opens the confirmation modal for either approve or reject
  const openConfirm = (
    action: "approve" | "reject",
    type: "organiser" | "event",
    id: number,
    name: string
  ) => {
    setConfirmTarget({ action, type, id, name });
    setRejectReason("");
    setModalError("");
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setRejectReason("");
    setModalError("");
  };

  const submitConfirm = async () => {
    if (!confirmTarget) return;

    if (confirmTarget.action === "reject" && !rejectReason.trim()) {
      setModalError("Please provide a reason for rejection.");
      return;
    }

    const base =
      confirmTarget.type === "organiser"
        ? `http://localhost:4000/api/admin/organisers/${confirmTarget.action}/${confirmTarget.id}`
        : `http://localhost:4000/api/events/${confirmTarget.action}/${confirmTarget.id}`;

    try {
      setSubmitting(true);
      setModalError("");

      const res = await fetch(base, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body:
          confirmTarget.action === "reject"
            ? JSON.stringify({ reason: rejectReason.trim() })
            : undefined,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Action failed.");
      }

      closeConfirm();
      loadData();
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: "organisers" as Tab, label: "Pending Organisers", icon: <BsPeopleFill size={16} /> },
    { key: "pendingEvents" as Tab, label: "Pending Events", icon: <BsCalendarEvent size={16} /> },
    { key: "allEvents" as Tab, label: "All Events", icon: <BsListUl size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage organisers and events across EventNest.</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <BsCashStack />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">—</p>
            <p className="text-sm text-slate-500">Total Earnings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <BsGraphUpArrow />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">—</p>
            <p className="text-sm text-slate-500">This Month's Earnings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
            <BsPersonWorkspace />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{organisers.length}</p>
            <p className="text-sm text-slate-500">Pending Organisers</p>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
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
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : (
        <>
          {/* Pending Organisers */}
          {activeTab === "organisers" && (
            organisers.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No pending organiser applications.</div>
            ) : (
              <div className="space-y-4">
                {organisers.map((org) => (
                  <div key={org.organiser_id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{org.full_name}</p>
                      <p className="text-sm text-slate-500">{org.organisation_name}</p>
                      <p className="text-sm text-slate-400">{org.email} · {org.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openConfirm("approve", "organiser", org.organiser_id, org.full_name)}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100"
                      >
                        <BsCheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => openConfirm("reject", "organiser", org.organiser_id, org.full_name)}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                      >
                        <BsXCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Pending Events */}
          {activeTab === "pendingEvents" && (
            pendingEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No pending events.</div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div key={event.event_id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.event_date} · {event.venue}, {event.city}</p>
                      <p className="text-sm text-slate-400">by {event.organisation_name || event.full_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openConfirm("approve", "event", event.event_id, event.title)}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100"
                      >
                        <BsCheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => openConfirm("reject", "event", event.event_id, event.title)}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                      >
                        <BsXCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* All Events */}
          {activeTab === "allEvents" && (
            allEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No events found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allEvents.map((event) => (
                  <div key={event.event_id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-800">{event.title}</p>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{event.event_date} · {event.venue}, {event.city}</p>
                    <p className="text-sm text-slate-400 mt-1">by {event.organisation_name || event.full_name}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Confirmation Modal — used for both Approve and Reject */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BsExclamationTriangleFill
                  size={20}
                  className={confirmTarget.action === "approve" ? "text-emerald-500" : "text-red-500"}
                />
                <h3 className="text-lg font-bold text-slate-800">
                  {confirmTarget.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </h3>
              </div>
              <button onClick={closeConfirm} className="text-slate-400 hover:text-slate-700">
                <BsX size={22} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              {confirmTarget.action === "approve" ? (
                <>
                  Are you sure you want to approve{" "}
                  <span className="font-semibold text-slate-700">{confirmTarget.name}</span>?
                  {confirmTarget.type === "organiser"
                    ? " They will be able to log in and create events."
                    : " This event will move to the approved stage."}
                </>
              ) : (
                <>
                  You're about to reject{" "}
                  <span className="font-semibold text-slate-700">{confirmTarget.name}</span>. Please
                  provide a reason — this will be shown to them.
                </>
              )}
            </p>

            {confirmTarget.action === "reject" && (
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Missing required documentation, event details unclear..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:border-red-400"
              />
            )}

            {modalError && (
              <p className="text-red-500 text-sm mt-2">{modalError}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeConfirm}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitConfirm}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 ${
                  confirmTarget.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : confirmTarget.action === "approve"
                  ? "Yes, Approve"
                  : "Submit Rejection"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;