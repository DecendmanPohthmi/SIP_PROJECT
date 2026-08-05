import React, { useState } from "react";
import {
  BsCashCoin,
  BsCheckCircle,
  BsXCircle,
  BsX,
  BsExclamationTriangleFill,
  BsClockHistory,
  BsBank,
} from "react-icons/bs";

type WithdrawalRequest = {
  withdrawal_id: number;
  organiser_name: string;
  organisation_name: string;
  bank_name: string;
  bank_account_number: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
};

const SAMPLE_WITHDRAWALS: WithdrawalRequest[] = [
  { withdrawal_id: 1, organiser_name: "Devika Rao", organisation_name: "Skyline Events Co.", bank_name: "HDFC Bank", bank_account_number: "XXXX-XXXX-4521", amount: 45000, status: "pending", requested_at: "2026-07-21" },
  { withdrawal_id: 2, organiser_name: "Farhan Ali", organisation_name: "Pulse Productions", bank_name: "ICICI Bank", bank_account_number: "XXXX-XXXX-7789", amount: 28500, status: "pending", requested_at: "2026-07-20" },
  { withdrawal_id: 3, organiser_name: "Neha Kapoor", organisation_name: "Groove Collective", bank_name: "Axis Bank", bank_account_number: "XXXX-XXXX-3312", amount: 62000, status: "approved", requested_at: "2026-07-14" },
  { withdrawal_id: 4, organiser_name: "Sanjay Gupta", organisation_name: "MetroMeet Org", bank_name: "SBI", bank_account_number: "XXXX-XXXX-9087", amount: 15000, status: "rejected", requested_at: "2026-07-10" },
  { withdrawal_id: 5, organiser_name: "Ritu Desai", organisation_name: "Artisan Fairs", bank_name: "Kotak Mahindra", bank_account_number: "XXXX-XXXX-5544", amount: 33000, status: "pending", requested_at: "2026-07-22" },
];

type ConfirmTarget = {
  action: "approved" | "rejected";
  withdrawal: WithdrawalRequest;
} | null;

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(SAMPLE_WITHDRAWALS);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [adminNote, setAdminNote] = useState("");

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const resolvedWithdrawals = withdrawals.filter((w) => w.status !== "pending");

  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const openConfirm = (action: "approved" | "rejected", withdrawal: WithdrawalRequest) => {
    setConfirmTarget({ action, withdrawal });
    setAdminNote("");
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setAdminNote("");
  };

  const submitConfirm = () => {
    if (!confirmTarget) return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.withdrawal_id === confirmTarget.withdrawal.withdrawal_id
          ? { ...w, status: confirmTarget.action }
          : w
      )
    );
    closeConfirm();
  };

  const statusBadge = (status: WithdrawalRequest["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700",
      approved: "bg-emerald-50 text-emerald-700",
      rejected: "bg-red-50 text-red-600",
    };
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Withdrawal Requests</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and process payout requests submitted by organisers.
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#49557E] text-white flex items-center justify-center text-lg">
            <BsClockHistory />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#49557E]">{pendingWithdrawals.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Requests</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-lg">
            <BsCashCoin />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalPendingAmount)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending Payout Amount</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-lg">
            <BsCheckCircle />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {withdrawals.filter((w) => w.status === "approved").length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Paid Out This Month</p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <h2 className="text-base font-bold text-slate-800 mb-4">Pending Requests</h2>

      {pendingWithdrawals.length === 0 ? (
        <p className="text-slate-400 text-sm mb-10">No pending withdrawal requests.</p>
      ) : (
        <div className="space-y-3 mb-10">
          {pendingWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.withdrawal_id}
              className="bg-white border border-slate-200 rounded-xl p-5 border-l-4 border-l-amber-400"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-semibold text-slate-800 text-sm">{withdrawal.organiser_name}</p>
                    {statusBadge(withdrawal.status)}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{withdrawal.organisation_name}</p>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <BsBank size={13} className="text-[#49557E]" />
                    <span>{withdrawal.bank_name} · {withdrawal.bank_account_number}</span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">Requested {formatDate(withdrawal.requested_at)}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <p className="text-xl font-bold text-[#49557E]">{formatCurrency(withdrawal.amount)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openConfirm("approved", withdrawal)}
                      className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100"
                    >
                      <BsCheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => openConfirm("rejected", withdrawal)}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                    >
                      <BsXCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Requests */}
      <h2 className="text-base font-bold text-slate-800 mb-4">Resolved</h2>

      {resolvedWithdrawals.length === 0 ? (
        <p className="text-slate-400 text-sm">No resolved requests yet.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60">
                <th className="px-5 py-3 font-medium">Organiser</th>
                <th className="px-5 py-3 font-medium">Bank</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {resolvedWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.withdrawal_id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{withdrawal.organiser_name}</p>
                    <p className="text-xs text-slate-400">{withdrawal.organisation_name}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {withdrawal.bank_name} · {withdrawal.bank_account_number}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{formatCurrency(withdrawal.amount)}</td>
                  <td className="px-5 py-3">{statusBadge(withdrawal.status)}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(withdrawal.requested_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BsExclamationTriangleFill
                  size={20}
                  className={confirmTarget.action === "approved" ? "text-emerald-500" : "text-red-500"}
                />
                <h3 className="text-lg font-bold text-slate-800">
                  {confirmTarget.action === "approved" ? "Approve Withdrawal" : "Reject Withdrawal"}
                </h3>
              </div>
              <button onClick={closeConfirm} className="text-slate-400 hover:text-slate-700">
                <BsX size={22} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              {confirmTarget.action === "approved" ? (
                <>
                  Approve a payout of{" "}
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(confirmTarget.withdrawal.amount)}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {confirmTarget.withdrawal.organiser_name}
                  </span>
                  's {confirmTarget.withdrawal.bank_name} account?
                </>
              ) : (
                <>
                  Reject the withdrawal request from{" "}
                  <span className="font-semibold text-slate-700">
                    {confirmTarget.withdrawal.organiser_name}
                  </span>
                  ?
                </>
              )}
            </p>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Optional note for internal records..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:border-[#49557E]"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeConfirm}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitConfirm}
                className={`flex-1 py-2.5 rounded-lg text-white font-medium ${
                  confirmTarget.action === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmTarget.action === "approved" ? "Confirm Approval" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;