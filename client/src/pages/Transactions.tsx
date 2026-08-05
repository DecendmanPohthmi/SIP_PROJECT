import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { BsReceiptCutoff, BsArrowCounterclockwise, BsArrowRightShort } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

interface DecodedToken {
  id: string;
  role: string;
}

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const Transactions = () => {
  const { token } = useAuth();
  const id = token ? jwtDecode<DecodedToken>(token).id : null;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [refundTransactions, setRefundTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const authHeaders = { token: token || "" };

  const fetchTransactions = async () => {
    if (!token || !id) return;

    try {
      setTransactionsLoading(true);

      // 1. Fetch standard transactions
      const txnRes = await fetch(`${API}/api/user/${id}/transactions`, { headers: authHeaders });
      const txnData = await txnRes.json();
      if (txnData.success) {
        setTransactions(txnData.transactions || []);
      }

      // 2. Fetch refunds
      const refundRes = await fetch(`${API}/api/refunds/my-refunds`, { headers: authHeaders });
      const refundData = await refundRes.json();
      if (refundData.success) {
        setRefundTransactions(refundData.refunds || []);
      }
    } catch (err) {
      console.log("fetchTransactions error:", err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, id]);

  return (
    <div className="space-y-6">
      {/* Main Transaction History */}
      <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Transaction History</h2>

        {transactionsLoading ? (
          <p className="text-sm text-slate-400">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, idx) => {
              const isRefunded = txn.transaction_status === "refunded";

              return (
                <div
                  key={txn.transaction_id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="animate-fade-in-up p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm hover:border-slate-200 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isRefunded ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isRefunded ? <BsArrowCounterclockwise size={18} /> : <BsReceiptCutoff size={18} />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{txn.event_title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRefunded
                              ? "bg-emerald-50 text-emerald-600"
                              : txn.transaction_status === "completed"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {txn.transaction_status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDateOnly(txn.created_at)} • Ref: {txn.booking_reference}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                        Order ID: {txn.razorpay_order_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
                    <p className={`text-sm font-bold ${isRefunded ? "text-emerald-600" : "text-slate-800"}`}>
                      {isRefunded ? `+₹${txn.total_amount}` : `-₹${txn.total_amount}`}
                    </p>

                    {isRefunded && (
                      <Link
                        to={`/refund-page?bookingId=${txn.booking_id}`}
                        className="text-xs font-medium text-[#FF4C24] hover:underline flex items-center gap-0.5 mt-1"
                      >
                        Refund Details
                        <BsArrowRightShort size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Separate Refund History Section */}
      <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">Refund Requests</h2>

        {transactionsLoading ? (
          <p className="text-sm text-slate-400">Loading refunds...</p>
        ) : refundTransactions.length === 0 ? (
          <p className="text-sm text-slate-400">No refund requests found.</p>
        ) : (
          <div className="space-y-3">
            {refundTransactions.map((ref, idx) => (
              <div
                key={ref.refund_id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="animate-fade-in-up p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm hover:border-slate-200 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50 text-emerald-600">
                    <BsArrowCounterclockwise size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{ref.event_title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                        {ref.status ? ref.status.toUpperCase() : "REQUESTED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Requested on: {formatDateOnly(ref.requested_at)} • Ref: {ref.booking_reference}
                    </p>
                    {ref.reason && (
                      <p className="text-[11px] text-slate-500">Reason: {ref.reason}</p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
                  <p className="text-sm font-bold text-emerald-600">+₹{ref.refund_amount}</p>
                  <Link
                    to={``}
                    className="text-xs font-medium text-[#FF4C24] hover:underline flex items-center gap-0.5 mt-1"
                  >
                    View Details
                    <BsArrowRightShort size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;