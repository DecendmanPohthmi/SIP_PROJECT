import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BsPeopleFill,
  BsEnvelope,
  BsTelephone,
  BsCalendarEvent,
  BsSearch,
  BsBuilding,
  BsCheckLg,
  BsXLg,
  BsTrash,
  BsExclamationTriangle,
  BsArrowRepeat,
} from "react-icons/bs";

type Organiser = {
  organiser_id: number;
  full_name: string;
  organisation_name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  events_count: number;
};

type ModalType = "approve" | "reject" | "delete" | null;

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const getInitials = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "ORG";

const AdminOrganisers = () => {
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // State for managing action confirmations
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedOrganiser, setSelectedOrganiser] = useState<Organiser | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // State for rejection/deletion explanation text
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const fetchOrganisersData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/api/organiser/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.organisers) {
        setOrganisers(response.data.organisers);
      }
    } catch (err: any) {
      console.error("Failed to fetch organisers:", err);
      setError(err.response?.data?.message || "Failed to load organisers data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganisersData(false);

    // Auto-update every 30 seconds
    const intervalId = setInterval(() => {
      fetchOrganisersData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchOrganisersData]);

  const openActionModal = (org: Organiser, type: ModalType) => {
    setSelectedOrganiser(org);
    setActiveModal(type);
    setRejectionReason(""); // Reset input on modal open
  };

  const closeModal = () => {
    if (actionLoading) return;
    setActiveModal(null);
    setSelectedOrganiser(null);
    setRejectionReason("");
  };

  // Status Change Handler (Approve / Reject)
  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!selectedOrganiser) return;

    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");

      const actionPath = status === "approved" ? "approve" : "reject";

      // Send rejection reason in req.body for rejections
      const payload = status === "rejected" ? { message: rejectionReason.trim() } : {};

      await axios.put(
        `${API_BASE_URL}/api/organiser/admin/${actionPath}/${selectedOrganiser.organiser_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI state locally
      setOrganisers((prev) =>
        prev.map((org) =>
          org.organiser_id === selectedOrganiser.organiser_id
            ? { ...org, status, rejection_reason: status === "rejected" ? rejectionReason.trim() : org.rejection_reason }
            : org
        )
      );

      closeModal();
    } catch (err: any) {
      console.error(`Failed to update status to ${status}:`, err);
      alert(err.response?.data?.message || "Failed to update organiser status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteOrganiser = async () => {
    if (!selectedOrganiser) return;

    if (!rejectionReason.trim()) {
      alert("Please provide a message explaining the removal.");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");

      // Note: Axios requires payload under `data` field for DELETE requests
      await axios.delete(
        `${API_BASE_URL}/api/organiser/admin/${selectedOrganiser.organiser_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            message: rejectionReason.trim(),
          },
        }
      );

      // Remove from UI state locally
      setOrganisers((prev) =>
        prev.filter((org) => org.organiser_id !== selectedOrganiser.organiser_id)
      );

      closeModal();
    } catch (err: any) {
      console.error("Failed to delete organiser:", err);
      alert(err.response?.data?.message || "Failed to delete organiser.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrganisers = organisers.filter((o) => {
    const fullName = o.full_name || "";
    const orgName = o.organisation_name || "";
    const email = o.email || "";

    const matchesSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      orgName.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusBadge = (status: Organiser["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-red-50 text-red-600 border border-red-200",
    };
    return (
      <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] || "bg-slate-50 text-slate-600"}`}>
        {status}
      </span>
    );
  };

  const statusFilters: { key: typeof statusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "approved", label: "Approved" },
    { key: "pending", label: "Pending" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="w-full overflow-x-hidden p-4 sm:p-6 bg-slate-50/50 min-h-screen space-y-6">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Organisers</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage and view all registered organisers.
          </p>
        </div>
        <button
          onClick={() => fetchOrganisersData(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          <span className="hidden xs:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Stat strip - 2 columns side-by-side on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E] text-white flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsPeopleFill />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-[#49557E] truncate">{organisers.length}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Total Organisers</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsCalendarEvent />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              {organisers.reduce((sum, o) => sum + (Number(o.events_count) || 0), 0)}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Total Events Created</p>
          </div>
        </div>
      </div>

      {/* All Organisers Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <BsBuilding className="text-[#49557E]" size={17} />
            All Organisers
          </h2>

          <div className="relative w-full sm:w-64">
            <BsSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or organisation..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#49557E] transition-colors"
            />
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                statusFilter === f.key
                  ? "bg-[#49557E] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Responsive Layout: Cards for mobile, Table for md+ screens */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Loading organisers...
          </div>
        ) : filteredOrganisers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No organisers match your search.
          </div>
        ) : (
          filteredOrganisers.map((org) => (
            <div
              key={org.organiser_id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(org.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{org.organisation_name || "—"}</p>
                    <p className="text-xs text-slate-400 truncate">{org.full_name}</p>
                  </div>
                </div>
                {statusBadge(org.status)}
              </div>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <BsEnvelope size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{org.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsTelephone size={12} className="text-slate-400 shrink-0" />
                  <span>{org.phone || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="text-slate-400">
                  Joined: <span className="text-slate-600 font-medium">{formatDate(org.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#49557E]/10 text-[#49557E] font-semibold px-2 py-0.5 rounded-full text-[11px]">
                    {org.events_count || 0} events
                  </span>

                  {org.status === "pending" && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => openActionModal(org, "approve")}
                        title="Approve Organiser"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      >
                        <BsCheckLg size={14} />
                      </button>
                      <button
                        onClick={() => openActionModal(org, "reject")}
                        title="Reject Organiser"
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      >
                        <BsXLg size={14} />
                      </button>
                    </div>
                  )}

                  {org.status === "rejected" && (
                    <button
                      onClick={() => openActionModal(org, "delete")}
                      title="Delete Organiser"
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-2"
                    >
                      <BsTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60 text-xs">
              <th className="px-5 py-3 font-medium">Organiser</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Events</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                  Loading organisers...
                </td>
              </tr>
            ) : filteredOrganisers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                  No organisers match your search.
                </td>
              </tr>
            ) : (
              filteredOrganisers.map((org) => (
                <tr
                  key={org.organiser_id}
                  className="border-b border-slate-50 last:border-0 hover:bg-[#49557E]/[0.03] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(org.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-xs sm:text-sm">{org.organisation_name || "—"}</p>
                        <p className="text-[11px] text-slate-400">{org.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BsEnvelope size={11} className="text-slate-400 shrink-0" />
                      <span className="text-xs">{org.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BsTelephone size={11} className="text-slate-400 shrink-0" />
                      <span className="text-xs">{org.phone || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 bg-[#49557E]/10 text-[#49557E] text-xs font-semibold px-2.5 py-1 rounded-full">
                      {org.events_count || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">{statusBadge(org.status)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(org.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 min-h-[30px]">
                      {org.status === "pending" && (
                        <>
                          <button
                            onClick={() => openActionModal(org, "approve")}
                            title="Approve Organiser"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <BsCheckLg size={14} />
                          </button>
                          <button
                            onClick={() => openActionModal(org, "reject")}
                            title="Reject Organiser"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            <BsXLg size={14} />
                          </button>
                        </>
                      )}

                      {org.status === "rejected" && (
                        <button
                          onClick={() => openActionModal(org, "delete")}
                          title="Delete Organiser"
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <BsTrash size={14} />
                        </button>
                      )}

                      {org.status === "approved" && (
                        <span className="text-xs text-slate-300 pr-2">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {activeModal && selectedOrganiser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                activeModal === "approve"
                  ? "bg-emerald-100 text-emerald-600"
                  : activeModal === "reject"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {activeModal === "approve" ? (
                <BsCheckLg size={22} />
              ) : activeModal === "reject" ? (
                <BsExclamationTriangle size={22} />
              ) : (
                <BsTrash size={22} />
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-800 capitalize mb-1">
              {activeModal} Organiser?
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to {activeModal}{" "}
              <span className="font-semibold text-slate-700">
                "{selectedOrganiser.organisation_name || selectedOrganiser.full_name}"
              </span>
              ? {activeModal === "delete" && "This action cannot be undone."}
            </p>

            {/* Rejection or Removal reason textarea */}
            {(activeModal === "reject" || activeModal === "delete") && (
              <div className="mb-4 text-left">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeModal === "reject" ? "Rejection Reason" : "Removal Explanation"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    activeModal === "reject"
                      ? "Enter reason for rejection..."
                      : "Enter reason for account removal..."
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 resize-none bg-slate-50/50"
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                disabled={actionLoading}
                onClick={closeModal}
                className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {activeModal === "approve" && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus("approved")}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Approving..." : "Yes, Approve"}
                </button>
              )}

              {activeModal === "reject" && (
                <button
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={() => handleUpdateStatus("rejected")}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Rejecting..." : "Yes, Reject"}
                </button>
              )}

              {activeModal === "delete" && (
                <button
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={handleDeleteOrganiser}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? "Deleting..." : "Yes, Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrganisers;