import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  BsWallet2,
  BsCashStack,
  BsArrowUpRightCircle,
  BsClockHistory,
  BsBank,
  BsExclamationCircle,
  BsCheckCircle,
  BsInfoCircle,
  BsQrCode,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type PayoutRecord = {
  payout_id: number;
  amount: number;
  payout_type: "bank" | "upi";
  bank_name?: string;
  account_number?: string;
  upi_id?: string;
  status: "pending" | "completed" | "rejected";
  requested_at: string;
  processed_at?: string;
  rejection_reason?: string;
};

type BalanceSummary = {
  total_earnings: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  available_balance: number;
};

interface DecodedToken {
  id: string;
  role: string;
}

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const OrganiserWithdraw = () => {
  const { token } = useAuth();
  const id = token ? jwtDecode<DecodedToken>(token).id : null;
  const authHeaders = { token: token || "", "Content-Type": "application/json" };

  // Balance & History State
  const [balance, setBalance] = useState<BalanceSummary>({
    total_earnings: 0,
    total_withdrawn: 0,
    pending_withdrawals: 0,
    available_balance: 0,
  });

  const [history, setHistory] = useState<PayoutRecord[]>([]);

  // Payout Method State ('bank' or 'upi')
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "upi">("bank");

  // Form Inputs State
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [ifscCode, setIfscCode] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");

  // Validation & UI State
  const [formError, setFormError] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch organiser balance, profile details, and payout history
  const fetchWithdrawData = async () => {
    if (!id || !token) return;

    try {
      setLoading(true);

      // 1. Fetch Organiser Profile (for bank details, UPI ID, and wallet earnings)
      const profileRes = await fetch(`${API}/api/organiser/me/${id}`, {
        headers: { token },
      });
      const profileData = await profileRes.json();

      if (profileData.success && profileData.organiser) {
        const org = profileData.organiser;
        
        // Populate fields from database
        setBankName(org.bank_name || "");
        setAccountNumber(org.bank_account_number || "");
        setIfscCode(org.bank_ifsc_code || "");
        setAccountHolder(org.full_name || "");
        setUpiId(org.upi_id || "");

        // Compute balances
        const totalEarnings = parseFloat(org.total_balance || org.totalBalance || "0");
        const withdrawnAmt = parseFloat(org.withdrawn_amount || org.withdrawnAmount || "0");
        const pendingAmt = parseFloat(org.pending_withdrawals || org.pendingWithdrawals || "0");
        const available = totalEarnings - withdrawnAmt - pendingAmt;

        setBalance({
          total_earnings: totalEarnings,
          total_withdrawn: withdrawnAmt,
          pending_withdrawals: pendingAmt,
          available_balance: available > 0 ? available : 0,
        });
      }

      // 2. Fetch Payout History
      const payoutRes = await fetch(`${API}/api/payouts/payouts`, {
        headers: { token },
      });
      const payoutData = await payoutRes.json();
      
      if (payoutData.success) {
        setHistory(payoutData.payouts || []);
      }
    } catch (err) {
      console.error("Error fetching withdrawal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchWithdrawData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  // Pre-validate form inputs before opening confirmation modal
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const numericAmount = parseFloat(withdrawAmount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Please enter a valid withdrawal amount.");
      return;
    }

    if (numericAmount < 300) {
      setFormError("Minimum withdrawal amount is ₹300.");
      return;
    }

    if (numericAmount > balance.available_balance) {
      setFormError("Withdrawal amount cannot exceed your available balance.");
      return;
    }

    if (payoutMethod === "bank") {
      if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolder.trim()) {
        setFormError("Please fill out all required bank account details.");
        return;
      }
    } else {
      if (!upiId.trim()) {
        setFormError("Please enter a valid UPI ID.");
        return;
      }
    }

    setIsConfirmOpen(true);
  };

  // Submit actual payout request to the backend API
  const handleExecuteWithdrawal = async () => {
    setSubmitting(true);
    setFormError("");

    try {
      const requestedAmt = parseFloat(withdrawAmount);

      const payload = {
        amount: requestedAmt,
        payout_type: payoutMethod,
        ...(payoutMethod === "bank"
          ? {
              bank_name: bankName.trim(),
              account_number: accountNumber.trim(),
              bank_ifsc_code: ifscCode.trim(),
              account_holder: accountHolder.trim(),
            }
          : {
              upi_id: upiId.trim(),
            }),
      };

      const res = await fetch(`${API}/api/payouts/withdraw`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to submit withdrawal request.");
      }

      // Refresh data from server to sync updated balances and history
      await fetchWithdrawData();

      // Reset UI state
      setIsConfirmOpen(false);
      setWithdrawAmount("");
      setSuccessMsg(`Successfully requested payout of ₹${requestedAmt.toLocaleString("en-IN")} via ${payoutMethod.toUpperCase()}!`);

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setFormError(err.message || "An error occurred while processing your request.");
      setIsConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status: PayoutRecord["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-red-50 text-red-600 border border-red-200",
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-slate-400 text-sm">
        Loading payout details...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Payouts & Withdrawals</h1>
        <p className="text-slate-500 text-sm mt-1">
          Request payouts from your event ticket sales directly to your bank account or UPI ID.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <BsCheckCircle className="shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#49557E] to-[#363f5e] text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-200">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <BsWallet2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(balance.available_balance)}</p>
          <p className="text-[11px] text-slate-300 mt-2">Ready for withdrawal</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Net Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-[#49557E]/10 flex items-center justify-center text-[#49557E]">
              <BsCashStack size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(balance.total_earnings)}</p>
          <p className="text-[11px] text-slate-400 mt-2">All time ticket sales income</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BsClockHistory size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(balance.pending_withdrawals)}</p>
          <p className="text-[11px] text-slate-400 mt-2">Currently under review</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BsArrowUpRightCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(balance.total_withdrawn)}</p>
          <p className="text-[11px] text-slate-400 mt-2">Paid out securely</p>
        </div>
      </div>

      {/* Main Form & Destination Section */}
      <form onSubmit={handleOpenConfirm} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Withdraw Input Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BsCashStack className="text-[#49557E]" size={17} />
              Request Payout
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <BsExclamationCircle className="shrink-0" size={14} />
                <span>{formError}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Amount to Withdraw (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[11px] text-slate-400">Min limit: ₹300</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(balance.available_balance.toString())}
                  className="text-[11px] font-semibold text-[#49557E] hover:underline"
                >
                  Withdraw Max
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 space-y-1 mb-6">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 mb-1">
                <BsInfoCircle size={13} className="text-[#49557E]" />
                Payout Info
              </div>
              <p>• Bank transfers take 24–48 working hours.</p>
              <p>• UPI transfers are typically processed instantly.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={balance.available_balance <= 0}
            className="w-full py-2.5 px-4 bg-[#49557E] text-white text-xs font-semibold rounded-xl hover:bg-[#3b4566] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Review & Request Payout
          </button>
        </div>

        {/* Payout Method Selector & Details */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Choose Payout Destination</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select how you want to receive your funds</p>
            </div>

            {/* Toggle Switch Tabs */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPayoutMethod("bank");
                  setFormError("");
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  payoutMethod === "bank"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BsBank size={14} className="text-[#49557E]" /> Bank Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayoutMethod("upi");
                  setFormError("");
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  payoutMethod === "upi"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BsQrCode size={14} className="text-[#49557E]" /> UPI ID
              </button>
            </div>
          </div>

          {payoutMethod === "bank" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Account Holder Name"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank Name"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="IFSC Code"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors uppercase"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-md animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Enter UPI ID (VPA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                  placeholder="e.g. username@okhdfcbank"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#49557E] transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Make sure your UPI ID is linked to an active Google Pay, PhonePe, Paytm, or BHIM account.
              </p>
            </div>
          )}
        </div>
      </form>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BsClockHistory className="text-[#49557E]" size={17} />
            Payout History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60">
                <th className="px-5 py-3 font-medium">Requested On</th>
                <th className="px-5 py-3 font-medium">Method / Destination</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Processed On</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                    No past payout requests found.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr
                    key={item.payout_id}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#49557E]/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {formatDate(item.requested_at)}
                    </td>
                    <td className="px-5 py-3">
                      {item.payout_type === "upi" ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase mb-0.5">UPI</span>
                          <p className="font-medium text-slate-800 text-xs">{item.upi_id}</p>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase mb-0.5">Bank</span>
                          <p className="font-medium text-slate-800 text-xs">{item.bank_name || "Bank Account"}</p>
                          <p className="text-[11px] text-slate-400">
                            A/C: •••• {item.account_number ? item.account_number.slice(-4) : "XXXX"}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3">
                      {statusBadge(item.status)}
                      {item.rejection_reason && (
                        <p className="text-[11px] text-red-500 mt-1 max-w-xs">
                          Reason: {item.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-xs">
                      {formatDate(item.processed_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Confirm Withdrawal
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Please review your payout destination details before submitting.
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 mb-5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-[#49557E]">
                  {formatCurrency(parseFloat(withdrawAmount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-medium text-slate-700 uppercase">{payoutMethod}</span>
              </div>
              {payoutMethod === "bank" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank:</span>
                    <span className="font-medium text-slate-700">{bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account No:</span>
                    <span className="font-medium text-slate-700">•••• {accountNumber.slice(-4)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI ID:</span>
                  <span className="font-medium text-slate-700">{upiId}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteWithdrawal}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#49557E] rounded-xl hover:bg-[#3b4566] transition-colors disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganiserWithdraw;