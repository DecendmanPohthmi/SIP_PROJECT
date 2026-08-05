import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaTicketAlt,
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaUserClock,
} from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";

type EventType = {
  event_id?: number;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  event_date?: string;
  venue?: string;
  city?: string;
  start_time?: string;
  end_time?: string;
  pricing_mode?: string;
  available_capacity?: number;
  total_capacity?: number;
  image_url?: string;
  organiser_id?: number;
  user_id?: number;
};

type TicketType = {
  ticket_type_id: number;
  ticket_name: string;
  price: number;
  available_quantity: number;
};

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const formatDateOnly = (dateStr?: string) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${suffix}`;
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    number | null
  >(null);
  const [quantity, setQuantity] = useState(1);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Waitlist state
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API}/api/events/${id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Event not found");
        }

        setEvent(data.event);
      } catch (err) {
        console.error(err);
        setError("Could not load this event.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTicketTypes = async () => {
      try {
        const res = await fetch(`${API}/api/events/${id}/tickets`);
        const data = await res.json();

        if (data.success) {
          setTicketTypes(data.tickets || []);
          if (data.tickets?.length === 1) {
            setSelectedTicketTypeId(data.tickets[0].ticket_type_id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (id) {
      fetchEvent();
      fetchTicketTypes();
    }
  }, [id]);

  const selectedTicket = ticketTypes.find(
    (t) => t.ticket_type_id === selectedTicketTypeId,
  );

  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;
  const isFree = totalAmount === 0 || selectedTicket?.price === 0 || event?.pricing_mode === "free";
  
  const overallSoldOut = event?.available_capacity === 0;
  const isSoldOut =
    overallSoldOut ||
    (selectedTicket ? selectedTicket.available_quantity === 0 : false);

  // Handle Joining Waitlist
  const handleJoinWaitlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setJoiningWaitlist(true);
      setBookingError(null);
      setWaitlistSuccess(null);

      const res = await fetch(`${API}/api/bookings/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          event_id: event?.event_id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.waitlist) {
        throw new Error(data.message || "Failed to join waitlist.");
      }

      setWaitlistSuccess(
        "You have been successfully added to the waitlist! We will notify you if a spot opens up.",
      );
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong joining waitlist.");
    } finally {
      setJoiningWaitlist(false);
    }
  };

  // Handle Razorpay Payment flow for paid bookings
  const handlePayment = async (
    bookingId: number,
    amount: number,
    organizerId: number,
  ) => {
    try {
      const orderRes = await fetch(`${API}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          booking_id: bookingId,
          total_amount: amount,
          organiser_id: organizerId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(
          orderData.message || "Failed to initialize payment gateway.",
        );
      }

      const { order } = orderData;

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "",
        amount: order.amount,
        currency: order.currency,
        name: event?.title || "Event Ticket",
        description: `Booking Reference: ${order.receipt}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(
              `${API}/api/payments/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  token: token || "",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            navigate(`/my-bookings/${bookingId}`);
          } catch (verifyErr: any) {
            setBookingError(
              verifyErr.message || "Payment verification failed.",
            );
            setBooking(false);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#49557E",
        },
      };

      const rzp = intonewRazorpayWindow(options);
      rzp.open();
    } catch (payErr: any) {
      setBookingError(payErr.message || "Payment processing error.");
      setBooking(false);
    }
  };

  const intonewRazorpayWindow = (options: any) => {
    const WinRazorpay = (window as any).Razorpay;
    return new WinRazorpay(options);
  };

  const handleBookingClick = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedTicketTypeId) {
      setBookingError("Please select a ticket type.");
      return;
    }

    if (quantity < 1) {
      setBookingError("Quantity must be at least 1.");
      return;
    }

    if (selectedTicket && quantity > selectedTicket.available_quantity) {
      setBookingError(
        `Only ${selectedTicket.available_quantity} tickets remaining for this type.`,
      );
      return;
    }

    try {
      setBooking(true);
      setBookingError(null);
      setBookingSuccess(null);

      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || "",
        },
        body: JSON.stringify({
          event_id: event?.event_id,
          ticket_type_id: selectedTicketTypeId,
          quantity,
          total_amount: totalAmount,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Booking failed.");
      }

      setBookingSuccess(data.booking);

      if (totalAmount === 0 || data.booking.booking_status === "confirmed") {
        navigate(`/my-bookings/${data.booking.booking_id}`);
      } else {
        const hostOrganizerId =
          event?.organiser_id ||
          event?.user_id ||
          data.booking.organizer_id ||
          1;

        await handlePayment(
          data.booking.booking_id,
          totalAmount,
          hostOrganizerId,
        );
      }
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong.");
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-center text-base sm:text-lg text-slate-500 py-16 sm:py-20">
        <div className="animate-pulse">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-center px-4 py-16 sm:py-20">
        <p className="text-base sm:text-lg text-red-500 mb-4">
          {error || "Event not found."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold text-sm sm:text-base"
        >
          <FaArrowLeft size={12} /> Back to Home
        </Link>
      </div>
    );
  }

  const isLowStock =
    typeof event.available_capacity === "number" &&
    event.available_capacity > 0 &&
    event.available_capacity <= 10;

  return (
    <div className="bg-slate-50/50 min-h-screen pb-12 sm:pb-16">
      <div className="max-w-5xl mx-3 sm:mx-auto pt-4 sm:pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-xs sm:text-sm mb-3 sm:mb-4 transition-colors"
        >
          <FaArrowLeft size={11} /> Back to events
        </Link>
      </div>

      <div className="max-w-5xl mx-3 sm:mx-auto bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
        {/* Event Image */}
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
              <FaCalendarAlt size={48} className="opacity-60" />
            </div>
          )}

          {event.category && (
            <span className="absolute top-4 left-4 bg-white text-slate-700 text-xs sm:text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
              {event.category}
            </span>
          )}

          {typeof event.available_capacity === "number" && (
            <span
              className={`absolute top-4 right-4 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-sm ${
                overallSoldOut
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : isLowStock
                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}
            >
              {overallSoldOut ? "Sold out" : `${event.available_capacity} left`}
            </span>
          )}
        </div>

        {/* Event Details */}
        <div className="p-5 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-1 leading-tight text-slate-800 tracking-tight">
            {event.title}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed">
            {event.description}
          </p>

          {/* Info grid */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FaCalendarAlt size={14} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Date
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  {formatDateOnly(event.event_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FaClock size={14} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Time
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  {formatTime(event.start_time)} – {formatTime(event.end_time)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FaMapMarkerAlt size={14} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Location
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  {event.venue}, {event.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <FaTicketAlt size={14} />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Seats
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  {event.available_capacity} / {event.total_capacity} available
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Type Selection */}
          {ticketTypes.length > 0 && (
            <div className="mt-8 sm:mt-10 border-t border-slate-200 pt-6 sm:pt-8">
              <h3 className="text-base sm:text-lg font-bold mb-4 text-slate-800">
                Select tickets
              </h3>

              {/* Refund Policy Notice - Only displayed if NOT free */}
              {!isFree && (
                <div className="mb-5 flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-lg px-3.5 sm:px-4 py-3 text-xs sm:text-sm text-rose-700">
                  <BsInfoCircle
                    size={14}
                    className="text-rose-500 shrink-0 mt-0.5"
                  />
                  <p>
                    Refund available before the event date. However, a{" "}
                    <strong className="text-rose-900 font-bold">
                      15% cancellation fee
                    </strong>{" "}
                    will be deducted from your total refund amount if you
                    cancel.
                  </p>
                </div>
              )}

              <div className="space-y-2.5">
                {ticketTypes.map((ticket) => {
                  const isSelected =
                    selectedTicketTypeId === ticket.ticket_type_id;
                  const isTicketSoldOut = ticket.available_quantity === 0;

                  return (
                    <label
                      key={ticket.ticket_type_id}
                      className={`flex items-center justify-between rounded-xl p-3.5 sm:p-4 transition-all duration-200 border-2 ${
                        isTicketSoldOut
                          ? "border-slate-100 bg-slate-100/50 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "border-[#49557E] bg-slate-50 shadow-sm cursor-pointer"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticketType"
                          className="w-4 h-4 accent-[#49557E]"
                          checked={isSelected}
                          disabled={isTicketSoldOut}
                          onChange={() =>
                            setSelectedTicketTypeId(ticket.ticket_type_id)
                          }
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {ticket.ticket_name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {isTicketSoldOut ? (
                              <span className="text-rose-600 font-bold">
                                Sold Out
                              </span>
                            ) : (
                              `Available: ${ticket.available_quantity} seats`
                            )}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-bold ${
                          ticket.price === 0
                            ? "text-emerald-600"
                            : "text-slate-800"
                        }`}
                      >
                        {ticket.price === 0 ? "Free" : `₹${ticket.price}`}
                      </span>
                    </label>
                  );
                })}
              </div>

              {!isSoldOut && (
                <div className="flex items-center gap-4 mt-5">
                  <label className="text-sm font-semibold text-slate-700">
                    Quantity
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <FaMinus size={10} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={
                        selectedTicket?.available_quantity ||
                        event.available_capacity ||
                        10
                      }
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value)))
                      }
                      className="w-14 text-center border-x border-slate-200 py-2 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(
                            selectedTicket?.available_quantity ??
                              event.available_capacity ??
                              10,
                            q + 1,
                          ),
                        )
                      }
                      className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              )}

              {selectedTicket && !isSoldOut && (
                <p className="mt-4 text-sm sm:text-base text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 inline-block">
                  Total:{" "}
                  <strong className="text-slate-800">
                    {totalAmount === 0 ? "Free" : `₹${totalAmount}`}
                  </strong>
                </p>
              )}
            </div>
          )}

          {bookingError && (
            <p className="text-red-600 text-xs sm:text-sm mt-4 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
              {bookingError}
            </p>
          )}

          {waitlistSuccess && (
            <p className="text-emerald-700 text-xs sm:text-sm mt-4 bg-emerald-50 border border-emerald-100 rounded-lg px-3.5 py-2.5">
              {waitlistSuccess}
            </p>
          )}

          {/* Conditional Action Button: Book/Pay vs Join Waitlist */}
          {isSoldOut ? (
            <button
              onClick={handleJoinWaitlist}
              disabled={joiningWaitlist}
              className="mt-5 sm:mt-6 w-full sm:w-auto bg-amber-600 text-white px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              <FaUserClock size={16} />
              {joiningWaitlist ? "Joining Waitlist..." : "Join Waitlist"}
            </button>
          ) : (
            <button
              onClick={handleBookingClick}
              disabled={booking}
              className="mt-5 sm:mt-6 w-full sm:w-auto bg-[#49557E] text-white px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-[#3c4768] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {booking
                ? "Processing..."
                : totalAmount === 0
                  ? "Book Free Ticket"
                  : `Pay ₹${totalAmount}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;