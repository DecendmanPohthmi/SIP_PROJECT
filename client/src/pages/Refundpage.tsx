import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  BsArrowLeft,
  BsCalendarEvent,
  BsGeoAlt,
  BsTicketDetailed,
  BsCheckCircle,
  BsBank,
  BsExclamationCircle,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";
const REFUND_DEDUCTION_PERCENT = 15;

type Booking = {
  booking_id: number;
  event_id: number;
  booking_reference: string;
  quantity: number;
  total_amount: string;
  booking_status: string;
  event_status: string;
  title: string;
  event_date: string;
  city: string;
  ticket_name: string;
  transaction_id: number;
};

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const RefundPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<any>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("No booking specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API}/api/bookings/${bookingId}`, {
          headers: { token: token || "" },
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Could not load this booking.");
        }

        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBooking();
  }, [bookingId, token]);

  const totalAmount = booking ? parseFloat(booking.total_amount) : 0;
  const deductionAmount = (totalAmount * REFUND_DEDUCTION_PERCENT) / 100;
  const refundAmount = totalAmount - deductionAmount;
  const isFree = totalAmount === 0;

  // Handle Free Booking Cancellation
  const handleCancelBooking = async () => {
    if (!booking) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await fetch(
        `${API}/api/bookings/${booking.booking_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Could not cancel booking.");
      }

      setSubmitted({ type: "cancelled", data: data.booking || { success: true } });
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Paid Event Refund Request
  const handleRequestRefund = async () => {
    if (!booking) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await fetch(
        `${API}/api/refunds/${booking.booking_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({
            transaction_id: booking.transaction_id,
            refund_amount: refundAmount,
            reason: reason,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Could not submit refund request.");
      }

      setSubmitted({
        type: "refund",
        data: data.refund || data.booking || { success: true },
      });
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center text-sm sm:text-base text-slate-500 py-16 sm:py-20">
        <div className="animate-pulse">Loading booking...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center px-4 py-16 sm:py-20">
        <p className="text-base sm:text-lg text-red-500 mb-4">
          {error || "Booking not found."}
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold text-sm sm:text-base"
        >
          <BsArrowLeft size={14} /> Back to My Bookings
        </Link>
      </div>
    );
  }

  if (submitted) {
    const isCancelledAction = submitted.type === "cancelled";
    return (
      <div className="max-w-2xl mx-3 sm:mx-auto mt-6 sm:mt-10 mb-16">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-10 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <BsCheckCircle size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            {isCancelledAction ? "Booking Cancelled Successfully" : "Refund Requested"}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {isCancelledAction ? (
              <>
                Your free registration for{" "}
                <strong className="text-slate-700">
                  {booking.booking_reference}
                </strong>{" "}
                has been cancelled and your slot has been released.
              </>
            ) : (
              <>
                Your refund request for{" "}
                <strong className="text-slate-700">
                  {booking.booking_reference}
                </strong>{" "}
                has been submitted.{" "}
                <strong className="text-slate-700">₹{refundAmount.toFixed(2)}</strong>{" "}
                will be credited to your saved account once processed.
              </>
            )}
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-6 sm:mt-8 bg-[#49557E] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#3c4768] transition-colors"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen pb-12 sm:pb-16">
      <div className="max-w-2xl mx-3 sm:mx-auto pt-4 sm:pt-6">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-xs sm:text-sm mb-3 sm:mb-4 transition-colors"
        >
          <BsArrowLeft size={13} /> Back to My Bookings
        </Link>
      </div>

      <div className="max-w-2xl mx-3 sm:mx-auto bg-white shadow-sm rounded-2xl border border-slate-100 p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-1">
          {isFree ? "Cancel Free Booking" : "Request a Refund"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8">
          Reference: <strong className="text-slate-700">{booking.booking_reference}</strong>
        </p>

        {/* Booking summary */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 sm:p-5 space-y-3 mb-6 sm:mb-8">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            {booking.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <BsCalendarEvent size={13} className="text-[#49557E]" />
              {formatDateOnly(booking.event_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BsGeoAlt size={13} className="text-[#49557E]" />
              {booking.city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BsTicketDetailed size={13} className="text-[#49557E]" />
              {booking.ticket_name} × {booking.quantity}
            </span>
          </div>
        </div>

        {/* Separate Sections for Free vs Paid Bookings */}
        {isFree ? (
          <div className="space-y-6 mb-6 sm:mb-8">
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 sm:p-5 text-amber-800 flex items-start gap-3">
              <BsExclamationCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold mb-1">Free Event Cancellation Notice</p>
                Since this booking is free, cancelling will immediately release your slot back to the event capacity. No financial transactions are involved.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Refund breakdown for paid events */}
            <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 sm:mb-8">
              <div className="p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">Booking amount</span>
                  <span className="font-semibold text-slate-800">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-500">
                    Cancellation fee ({REFUND_DEDUCTION_PERCENT}%)
                  </span>
                  <span className="font-semibold text-red-500">
                    −₹{deductionAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-emerald-50 border-t border-slate-100">
                <span className="text-sm sm:text-base font-bold text-slate-800">
                  Refund amount
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-700">
                  ₹{refundAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Where refund goes */}
            <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3.5 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 mb-6 sm:mb-8">
              <BsBank size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <p>
                The refund amount will be credited to your saved bank account or UPI ID from your profile, or to the original payment source.
              </p>
            </div>
          </>
        )}

        {/* Reason (optional) */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            Reason <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={
              isFree
                ? "Let us know why you're cancelling..."
                : "Let us know why you're requesting a refund..."
            }
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-[#FF4C24] resize-none"
          />
        </div>

        {submitError && (
          <p className="text-red-600 text-xs sm:text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
            {submitError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isFree ? (
            <button
              onClick={handleCancelBooking}
              disabled={submitting}
              className="w-full sm:w-auto bg-[#FF4C24] text-white px-8 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#e03e1a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          ) : (
            <button
              onClick={handleRequestRefund}
              disabled={submitting}
              className="w-full sm:w-auto bg-[#FF4C24] text-white px-8 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#e03e1a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting..." : "Confirm Refund Request"}
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-700 font-semibold text-sm sm:text-base px-4 py-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;