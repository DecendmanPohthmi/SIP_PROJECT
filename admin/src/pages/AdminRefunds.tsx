import React, { useState, useEffect, useCallback } from "react";
import {
  BsArrowCounterclockwise,
  BsCheckCircle,
  BsXCircle,
  BsX,
  BsExclamationTriangleFill,
  BsClockHistory,
  BsSearch,
  BsCreditCard,
  BsBank,
  BsShieldCheck,
  BsArrowRepeat,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type RefundRequest = {
  refund_id: number;
  user_name: string;
  user_email: string;
  event_title: string;
  booking_reference: string;
  refund_amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  created_at: string;
};

type UserTransactionDetail = {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  bank_account_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  recent_transactions: {
    booking_reference: string;
    event_title: string;
    amount: number;
    payment_status: string;
    created_at: string;
  }[];
};

type ConfirmTarget = {
  action: "approve" | "reject";
  refund: RefundRequest;
} | null;

const AdminRefunds = () => {
  const { token } = useAuth();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [adminNote, setAdminNote] = useState("");

  // UI Message Banner State (replaces alerts with custom div banners)
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Transaction Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserTransactionDetail | null>(null);
  const [searchError, setSearchError] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4000);
  };

  // Fetch all refunds with background refresh support
  const fetchAllData = useCallback(async (isBackground = false) => {
    if (!token) return;
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      
      const res = await fetch(`${API}/api/refunds/`, { headers: authHeaders });
      const data = await res.json();

      if (data.success) {
        setRefunds(data.refunds || []);
      } else {
        console.warn("API returned success: false", data);
      }
    } catch (err) {
      console.error("Network or parsing error loading refunds:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData(false);

    // Auto-update every 30 seconds
    const intervalId = setInterval(() => {
      fetchAllData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  const pendingRefunds = refunds.filter((r) => r.status === "pending");
  const approvedRefunds = refunds.filter((r) => r.status === "approved");
  const resolvedRefunds = refunds.filter((r) => r.status !== "pending");
  const totalPendingAmount = pendingRefunds.reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);

  const formatCurrency = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

  const openConfirm = (action: "approve" | "reject", refund: RefundRequest) => {
    setConfirmTarget({ action, refund });
    setAdminNote("");
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setAdminNote("");
  };

  // Submit approval or rejection
  const submitConfirm = async () => {
    if (!confirmTarget) return;

    try {
      const endpoint =
        confirmTarget.action === "approve"
          ? `${API}/api/refunds/approve/${confirmTarget.refund.refund_id}`
          : `${API}/api/refunds/reject/${confirmTarget.refund.refund_id}`;

      const options: RequestInit = {
        method: "PUT",
        headers: authHeaders,
        body: confirmTarget.action === "reject" ? JSON.stringify({ reason: adminNote || "Rejected by admin" }) : undefined,
      };

      const res = await fetch(endpoint, options);
      const data = await res.json();

      if (data.success) {
        showBanner("success", data.message || "Refund status updated successfully.");
        fetchAllData(false); 
      } else {
        showBanner("error", data.message || "Failed to update refund status");
      }
    } catch (err) {
      console.error("Error updating refund:", err);
      showBanner("error", "Network error while modifying refund status.");
    } finally {
      closeConfirm();
    }
  };

  // Triggers final gateway payout processing (Step 3)
  const handleProcessRefund = async (refund_id: number) => {
    if (!window.confirm("Are you sure you want to execute this payout via Razorpay and reverse balances?")) return;

    try {
      const res = await fetch(`${API}/api/refunds/process/${refund_id}`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json();

      if (data.success) {
        showBanner("success", data.message || "Refund processed successfully via gateway.");
        fetchAllData(false);
      } else {
        showBanner("error", data.message || "Processing failed.");
      }
    } catch (err) {
      console.error("Processing error:", err);
      showBanner("error", "Server error during gateway payout.");
    }
  };

  // Handle User Transaction & Bank Lookup search
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setSearchError("");
      setSearchResult(null);

      const res = await fetch(`${API}/api/refunds/transactions?query=${encodeURIComponent(searchQuery)}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (data.success && data.user) {
        setSearchResult(data.user);
      } else {
        setSearchError(data.message || "No user or transaction records found matching criteria.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("An error occurred during lookup.");
    } finally {
      setSearching(false);
    }
  };

  const statusBadge = (status: RefundRequest["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-blue-50 text-blue-700 border border-blue-200",
      processed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-red-50 text-red-600 border border-red-200",
    };
    return (
      <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 w-full overflow-x-hidden min-h-screen bg-slate-50/50 space-y-6">
      
      {/* Header & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Refund Requests & Transactions</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review attendee refund requests, execute gateway payouts, and search user bank/transaction profiles.
          </p>
        </div>
        <button
          onClick={() => fetchAllData(false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          <span className="hidden xs:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Banner message div for feedback */}
      {bannerMessage && (
        <div
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border shadow-sm transition-all animate-fadeIn ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {bannerMessage.type === "success" ? <BsCheckCircle size={16} className="shrink-0 text-emerald-600" /> : <BsXCircle size={16} className="shrink-0 text-red-600" />}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E] text-white flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsClockHistory />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-[#49557E] truncate">{pendingRefunds.length}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Pending Requests</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsArrowCounterclockwise />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{formatCurrency(totalPendingAmount)}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Pending Amount</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsCheckCircle />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              {refunds.filter((r) => r.status === "processed").length}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Fully Processed Payouts</p>
          </div>
        </div>
      </div>

      {/* Lookup User Transaction & Bank Details Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <BsCreditCard className="text-[#49557E]" size={16} /> Lookup User Transaction & Bank Details
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          Search by user email, phone number, or booking reference number to review verified payout/bank details.
        </p>

        <form onSubmit={handleUserSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Email, Phone or Booking ID..."
              className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#49557E] bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-[#49557E] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#3b4467] transition-colors disabled:opacity-50"
          >
            {searching ? "Searching..." : "Lookup"}
          </button>
        </form>

        {searchError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs">
            {searchError}
          </div>
        )}

        {searchResult && (
          <div className="mt-6 border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  <BsShieldCheck className="text-emerald-600 shrink-0" /> {searchResult.full_name || "Unknown User"}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{searchResult.email} · {searchResult.phone}</p>
              </div>
              
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <p className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <BsBank size={13} /> Registered Bank Account:
                </p>
                <p className="truncate"><span className="text-slate-400">Holder:</span> {searchResult.bank_account_name || "N/A"}</p>
                <p className="truncate"><span className="text-slate-400">Bank:</span> {searchResult.bank_name || "N/A"}</p>
                <p className="truncate"><span className="text-slate-400">Account No:</span> {searchResult.account_number || "N/A"}</p>
                <p className="truncate"><span className="text-slate-400">IFSC:</span> {searchResult.ifsc_code || "N/A"}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3">Recent Transactions ({searchResult.recent_transactions?.length || 0})</h3>
              {searchResult.recent_transactions?.length === 0 ? (
                <p className="text-xs text-slate-400">No recent transaction entries found.</p>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
                  {searchResult.recent_transactions.map((tx, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{tx.event_title}</p>
                        <p className="text-slate-400 text-[10px] truncate">{tx.booking_reference} · {formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#49557E]">{formatCurrency(tx.amount)}</p>
                        <span className="text-[10px] text-emerald-600 uppercase font-semibold">{tx.payment_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approved Refunds Ready for Gateway Processing */}
      {approvedRefunds.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-blue-900">Approved — Ready to Payout</h2>
          <div className="space-y-3">
            {approvedRefunds.map((refund) => (
              <div key={refund.refund_id} className="bg-white border border-blue-200 rounded-2xl p-4 sm:p-5 border-l-4 border-l-blue-500 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{refund.user_name || "Attendee"}</p>
                      {statusBadge(refund.status)}
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-1">{refund.user_email}</p>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">
                      {refund.event_title} · <span className="text-slate-400">{refund.booking_reference}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <p className="text-lg sm:text-xl font-bold text-[#49557E]">{formatCurrency(refund.refund_amount)}</p>
                    <button
                      onClick={() => handleProcessRefund(refund.refund_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition-colors shadow-sm"
                    >
                      Process Payout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-800">Pending Requests</h2>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            Loading requests...
          </div>
        ) : pendingRefunds.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No pending refund requests found.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRefunds.map((refund) => (
              <div
                key={refund.refund_id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-400 shadow-sm"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{refund.user_name || "Attendee"}</p>
                      {statusBadge(refund.status)}
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-1">{refund.user_email}</p>
                    <p className="text-xs sm:text-sm text-slate-600 truncate mb-1">
                      {refund.event_title} · <span className="text-slate-400">{refund.booking_reference}</span>
                    </p>
                    <p className="text-xs text-slate-500 italic mt-1 bg-slate-50 p-2.5 rounded-xl">"{refund.reason}"</p>
                    <p className="text-[11px] text-slate-400 mt-2">Requested {formatDate(refund.created_at)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="text-lg sm:text-xl font-bold text-[#49557E]">{formatCurrency(refund.refund_amount)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openConfirm("approve", refund)}
                        className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <BsCheckCircle size={13} /> Approve
                      </button>
                      <button
                        onClick={() => openConfirm("reject", refund)}
                        className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <BsXCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Requests */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-800">Resolved History</h2>

        {resolvedRefunds.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No resolved requests yet.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60 text-xs">
                    <th className="px-4 sm:px-5 py-3 font-medium">User</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Event</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Amount</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Status</th>
                    <th className="px-4 sm:px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedRefunds.map((refund) => (
                    <tr key={refund.refund_id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 sm:px-5 py-3 font-medium text-slate-800 truncate max-w-[150px]">{refund.user_name || "Attendee"}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-500 truncate max-w-[180px]">{refund.event_title}</td>
                      <td className="px-4 sm:px-5 py-3 font-medium text-slate-700">{formatCurrency(refund.refund_amount)}</td>
                      <td className="px-4 sm:px-5 py-3">{statusBadge(refund.status)}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-400 text-xs">{formatDate(refund.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BsExclamationTriangleFill
                  size={18}
                  className={confirmTarget.action === "approve" ? "text-emerald-500" : "text-red-500"}
                />
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {confirmTarget.action === "approve" ? "Approve Refund" : "Reject Refund"}
                </h3>
              </div>
              <button onClick={closeConfirm} className="text-slate-400 hover:text-slate-700">
                <BsX size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mb-4">
              {confirmTarget.action === "approve" ? (
                <>
                  Approve refund of{" "}
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(confirmTarget.refund.refund_amount)}
                  </span>{" "}
                  for <span className="font-semibold text-slate-700">{confirmTarget.refund.user_name}</span>?
                </>
              ) : (
                <>
                  Reject the refund request from{" "}
                  <span className="font-semibold text-slate-700">{confirmTarget.refund.user_name}</span>?
                </>
              )}
            </p>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={confirmTarget.action === "reject" ? "Reason for rejection (Required)..." : "Optional internal note..."}
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm resize-none focus:outline-none focus:border-[#49557E] bg-slate-50/50 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitConfirm}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-medium shadow-sm transition-colors ${
                  confirmTarget.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmTarget.action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;