import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsTicketDetailed,
  BsCalendarEvent,
  BsGeoAlt,
  BsChevronRight,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type Booking = {
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  booking_reference: string;
  quantity: number;
  total_amount: string;
  booking_status: string;
  event_status: string;
  booking_date: string;
  checkedin: boolean;
  title: string;
  event_date: string;
  event_starting_time: string;
  city: string;
  ticket_name: string;
  event_cancelled_at?: string | null;
};

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";
const REFUND_WINDOW_DAYS = 30;

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isBeforeEventDay = (eventDateStr: string) => {
  if (!eventDateStr) return false;
  return eventDateStr.split("T")[0] > getLocalDateString();
};

const isEventToday = (eventDateStr: string) => {
  if (!eventDateStr) return false;
  return eventDateStr.split("T")[0] === getLocalDateString();
};

const isWithinRefundWindow = (cancelledAtStr?: string | null) => {
  if (!cancelledAtStr) return false;
  const cancelledAt = new Date(cancelledAtStr);
  const deadline = new Date(cancelledAt);
  deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
  return new Date() <= deadline;
};

const daysLeftToRefund = (cancelledAtStr?: string | null) => {
  if (!cancelledAtStr) return 0;
  const cancelledAt = new Date(cancelledAtStr);
  const deadline = new Date(cancelledAt);
  deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
  const msLeft = deadline.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
};

const bookingStatusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  cancelled: "bg-red-50 text-red-500",
  refunded: "bg-slate-100 text-slate-600",
};
const eventStatusStyles: Record<string, string> = {
  live: "bg-emerald-50 text-emerald-600",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-500",
};

const formatBookingStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const MyBookings = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");

  const fetchBookings = async () => {
    if (!token) return;

    try {
      setBookingsLoading(true);
      const res = await fetch(`${API}/api/bookings/my-bookings/history`, {
        headers: { token: token || "" },
      });
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.log("fetchBookings error:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handelCancelRequest = async (bookingId: number) => {
    try {
      setCancelError("");
      const res = await fetch(`${API}/api/bookings/${bookingId}/cancel-refund`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", token: token || "" },
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to cancel refund request.");

      fetchBookings();
    } catch (err: any) {
      console.log("handelCancelRequest error:", err);
      setCancelError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8">
      <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">My Bookings</h2>

      {cancelError && (
        <p className="text-red-600 text-xs sm:text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
          {cancelError}
        </p>
      )}

      {bookingsLoading ? (
        <p className="text-sm text-slate-400">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-400">You haven't made any bookings yet.</p>
      ) : (
        <div className="space-y-3.5">
          {bookings.map((booking, idx) => {
            const isFree = booking.total_amount === "0" || booking.total_amount === "0.00";
            const isPaid = !isFree;

            const isCancelledWithinWindow =
              booking.event_status === "cancelled" &&
              isWithinRefundWindow(booking.event_cancelled_at);

            const canRefund =
              isPaid &&
              !booking.checkedin &&
              booking.booking_status === "confirmed" &&
              (isBeforeEventDay(booking.event_date) || isCancelledWithinWindow);

            const canCancel =
              isFree &&
              !booking.checkedin &&
              booking.booking_status === "confirmed" &&
              (isBeforeEventDay(booking.event_date) || isEventToday(booking.event_date));

            const canRequestCancle =
              !isFree && booking.booking_status === "refund_requested";

            return (
              <div
                key={booking.booking_id}
                onClick={() => navigate(`/my-bookings/${booking.booking_id}`)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="animate-fade-in-up group relative flex items-stretch gap-0 border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`w-1.5 shrink-0 transition-all duration-300 group-hover:w-2.5 ${
                    booking.booking_status === "confirmed"
                      ? "bg-emerald-400"
                      : booking.booking_status === "pending"
                        ? "bg-amber-400"
                        : booking.booking_status === "refunded"
                          ? "bg-slate-300"
                          : "bg-red-400"
                  }`}
                />

                <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 tracking-wide">
                        {booking.booking_reference}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          bookingStatusStyles[booking.booking_status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatBookingStatus(booking.booking_status)}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          eventStatusStyles[booking.event_status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Event {formatBookingStatus(booking.event_status)}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-[#49557E] transition-colors">
                      {booking.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <BsCalendarEvent size={12} className="text-[#49557E]" />
                        {formatDateOnly(booking.event_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BsGeoAlt size={12} className="text-[#49557E]" />
                        {booking.city}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BsTicketDetailed size={12} className="text-[#49557E]" />
                        {booking.ticket_name} × {booking.quantity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Booked on {formatDateOnly(booking.booking_date)}
                    </p>

                    {isCancelledWithinWindow && (
                      <p className="text-[11px] text-red-500 font-medium">
                        Event cancelled — refund window closes in{" "}
                        {daysLeftToRefund(booking.event_cancelled_at)} day
                        {daysLeftToRefund(booking.event_cancelled_at) === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        isFree ? "text-emerald-600" : "text-slate-800"
                      }`}
                    >
                      {isFree ? "Free" : `₹${booking.total_amount}`}
                    </span>

                    <div className="flex items-center gap-2">
                      {canRefund && (
                        <Link
                          to={`/refund-page?bookingId=${booking.booking_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
                        >
                          Request Refund
                        </Link>
                      )}

                      {canCancel && (
                        <Link
                          to={`/refund-page?bookingId=${booking.booking_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
                        >
                          cancel Booking
                        </Link>
                      )}
                      {canRequestCancle && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handelCancelRequest(booking.booking_id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
                        >
                          Cancel Refund
                        </button>
                      )}

                      <BsChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-[#49557E] group-hover:translate-x-1 transition-all duration-300 hidden sm:block"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;