import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BsClockHistory,
  BsCheckCircleFill,
  BsXCircleFill,
  BsTrophy,
  BsCheckCircle,
  BsXCircle,
  BsTrash,
  BsCashStack,
  BsX,
  BsExclamationTriangleFill,
} from "react-icons/bs";

interface Organiser {
  organiser_id: string;
  full_name: string;
  organisation_name: string | null;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  events_hosted?: number;
  total_earnings?: number;
  rejection_reason?: string;
}

type ModalMode = "approve" | "reject" | "delete";

type ModalTarget = {
  mode: ModalMode;
  organiser: Organiser;
} | null;

const AdminOrganisers = () => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  const [pendingOrganisers, setPendingOrganisers] = useState<Organiser[]>([]);
  const [approvedOrganisers, setApprovedOrganisers] = useState<Organiser[]>([]);
  const [rejectedOrganisers, setRejectedOrganisers] = useState<Organiser[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);
  const [modalText, setModalText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const authHeaders = { token: token || "" };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint = "pending";
      if (activeTab === "approved") endpoint = "approved";
      if (activeTab === "rejected") endpoint = "rejected";

      const res = await fetch(`http://localhost:4000/api/admin/organisers/${endpoint}`, {
        method: "GET",
        headers: { ...authHeaders, "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.success) {
        if (activeTab === "pending") setPendingOrganisers(data.organisers || []);
        else if (activeTab === "approved") setApprovedOrganisers(data.organisers || []);
        else if (activeTab === "rejected") setRejectedOrganisers(data.organisers || []);
      } else {
        throw new Error(data.message || "Failed to load organizers.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeTab]);

  const openModal = (mode: ModalMode, organiser: Organiser) => {
    setModalTarget({ mode, organiser });
    setModalText("");
    setModalError("");
  };

  const closeModal = () => {
    setModalTarget(null);
    setModalText("");
    setModalError("");
  };

  const submitModal = async () => {
    if (!modalTarget) return;

    const { mode, organiser } = modalTarget;

    if ((mode === "reject" || mode === "delete") && !modalText.trim()) {
      setModalError(
        mode === "reject"
          ? "Please provide a reason for rejection."
          : "Please provide a message explaining the removal."
      );
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");

      let url = "";
      let method = "PUT";
      let body: string | undefined;

      if (mode === "approve") {
        url = `http://localhost:4000/api/admin/organisers/approve/${organiser.organiser_id}`;
      } else if (mode === "reject") {
        url = `http://localhost:4000/api/admin/organisers/reject/${organiser.organiser_id}`;
        body = JSON.stringify({ reason: modalText.trim() });
      } else {
        url = `http://localhost:4000/api/admin/organisers/${organiser.organiser_id}`;
        method = "DELETE";
        body = JSON.stringify({ message: modalText.trim() });
      }

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Action failed.");
      }

      closeModal();
      fetchData();
    } catch (err: any) {
      setModalError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalCopy = () => {
    if (!modalTarget) return { title: "", body: null };
    const name = modalTarget.organiser.full_name;

    if (modalTarget.mode === "approve") {
      return {
        title: "Confirm Approval",
        body: (
          <p className="text-sm text-slate-500 mb-4">
            Are you sure you want to approve <span className="font-semibold text-slate-700">{name}</span>?
            They will be able to log in and create events.
          </p>
        ),
      };
    }

    if (modalTarget.mode === "reject") {
      return {
        title: "Confirm Rejection",
        body: (
          <>
            <p className="text-sm text-slate-500 mb-4">
              You're about to reject <span className="font-semibold text-slate-700">{name}</span>. Please provide a reason — this will be shown to them.
            </p>
            <textarea
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="e.g. Missing required documentation..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:border-red-400"
            />
          </>
        ),
      };
    }

    return {
      title: "Delete Organiser",
      body: (
        <>
          <p className="text-sm text-slate-500 mb-4">
            You're about to permanently remove <span className="font-semibold text-slate-700">{name}</span> from
            EventNest. This cannot be undone. Please write a message — it will be emailed to them before removal.
          </p>
          <textarea
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            placeholder="e.g. Repeated policy violations, inactive account..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:border-red-400"
          />
        </>
      ),
    };
  };

  const { title, body } = modalCopy();

  const renderOrganiserCard = (org: Organiser, showApproveReject: boolean) => (
    <div
      key={org.organiser_id}
      className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4"
    >
      <div>
        <p className="font-bold text-slate-800">{org.full_name}</p>
        <p className="text-sm text-slate-500">{org.organisation_name || "Independent Organiser"}</p>
        <p className="text-sm text-slate-400">{org.email} · {org.phone}</p>
        {org.status === "rejected" && (
          <p className="text-sm text-red-500 mt-1">
            Reason: {org.rejection_reason || "No reason provided."}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {showApproveReject && (
          <>
            <button
              onClick={() => openModal("approve", org)}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <BsCheckCircle size={14} /> Approve
            </button>
            <button
              onClick={() => openModal("reject", org)}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <BsXCircle size={14} /> Reject
            </button>
          </>
        )}
        {!showApproveReject && (
          <button
            onClick={() => openModal("delete", org)}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <BsTrash size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Organisers</h1>
        <p className="text-slate-500 mt-1">Review applications and track organiser performance.</p>
      </div>

      {/* Top Earning Organisers */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <BsTrophy className="text-amber-500" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Top Earning Organisers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-bold text-slate-800">Shillong Events Co.</p>
              <p className="text-sm text-slate-500">₹1,84,200 earned</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-bold text-slate-800">Northeast Music Fest</p>
              <p className="text-sm text-slate-500">₹1,12,750 earned</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-orange-300 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-bold text-slate-800">TechTalks NE</p>
              <p className="text-sm text-slate-500">₹76,400 earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "pending" ? "border-black text-black font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BsClockHistory size={16} />
          Pending
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {activeTab === "pending" && loading ? "..." : pendingOrganisers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "approved" ? "border-black text-black font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BsCheckCircleFill size={16} className="text-emerald-500" />
          Approved
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {activeTab === "approved" && loading ? "..." : approvedOrganisers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "rejected" ? "border-black text-black font-semibold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BsXCircleFill size={16} className="text-red-500" />
          Rejected
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {activeTab === "rejected" && loading ? "..." : rejectedOrganisers.length}
          </span>
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm mb-4">Fetching data updates...</p>}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Pending */}
      {!loading && !error && activeTab === "pending" && (
        <div className="space-y-4 mb-10">
          {pendingOrganisers.map((org) => renderOrganiserCard(org, true))}
          {pendingOrganisers.length === 0 && (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl text-slate-400 text-sm">
              No pending organizer applications found.
            </div>
          )}
        </div>
      )}

      {/* Approved */}
      {!loading && !error && activeTab === "approved" && (
        <div className="space-y-4 mb-10">
          {approvedOrganisers.map((org) => renderOrganiserCard(org, false))}
          {approvedOrganisers.length === 0 && (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl text-slate-400 text-sm">
              No approved organizers found.
            </div>
          )}
        </div>
      )}

      {/* Rejected */}
      {!loading && !error && activeTab === "rejected" && (
        <div className="space-y-4 mb-10">
          {rejectedOrganisers.map((org) => renderOrganiserCard(org, false))}
          {rejectedOrganisers.length === 0 && (
            <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl text-slate-400 text-sm">
              No rejected applications found.
            </div>
          )}
        </div>
      )}

      {/* Unified Modal */}
      {modalTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BsExclamationTriangleFill
                  size={20}
                  className={modalTarget.mode === "approve" ? "text-emerald-500" : "text-red-500"}
                />
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <BsX size={22} />
              </button>
            </div>

            {body}

            {modalError && <p className="text-red-500 text-sm mt-2">{modalError}</p>}

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitModal}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 ${
                  modalTarget.mode === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : modalTarget.mode === "approve"
                  ? "Yes, Approve"
                  : modalTarget.mode === "reject"
                  ? "Submit Rejection"
                  : "Send & Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrganisers;