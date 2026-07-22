import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  // Formats ISO string (e.g., "2026-08-15T00:00:00.000Z") to "2026-08-15"
  return dateStr.split("T")[0];
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

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
    (t) => t.ticket_type_id === selectedTicketTypeId
  );

  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

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
      setBookingError(`Only ${selectedTicket.available_quantity} tickets remaining for this type.`);
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

      if (data.booking.booking_status === "confirmed") {
        navigate(`/my-bookings/${data.booking.booking_id}`);
      }
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-center text-lg text-slate-500 py-20">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-center py-20">
        <p className="text-lg text-red-500 mb-4">{error || "Event not found."}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 mb-16 bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Event Image */}
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-96 object-cover"
        />
      )}

      {/* Event Details */}
      <div className="p-8">
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
          {event.category}
        </span>

        <h1 className="text-4xl font-bold mt-4">{event.title}</h1>

        <p className="text-gray-600 mt-4">{event.description}</p>

        <div className="mt-8 space-y-3">
          <p>
            <strong>Date:</strong> {formatDateOnly(event.event_date)}
          </p>
          <p>
            <strong>Location:</strong> {event.venue}, {event.city}
          </p>
          <p>
            <strong>Time:</strong> {event.start_time} - {event.end_time}
          </p>
          <p>
            <strong>Pricing:</strong>{" "}
            {event.pricing_mode === "free" ? "FREE" : "Paid"}
          </p>
          <p>
            <strong>Seats:</strong> {event.available_capacity} / {event.total_capacity}
          </p>
        </div>

        {/* Ticket Type Selection */}
        {ticketTypes.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-3">Select tickets</h3>

            <div className="space-y-2">
              {ticketTypes.map((ticket) => (
                <label
                  key={ticket.ticket_type_id}
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer ${
                    selectedTicketTypeId === ticket.ticket_type_id
                      ? "border-black bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ticketType"
                      checked={selectedTicketTypeId === ticket.ticket_type_id}
                      onChange={() => setSelectedTicketTypeId(ticket.ticket_type_id)}
                    />
                    <span>{ticket.ticket_name}</span>
                  </div>
                  <span className="font-medium">
                    {ticket.price === 0 ? "Free" : `₹${ticket.price}`}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                min={1}
                max={selectedTicket?.available_quantity || event.available_capacity || 10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {selectedTicket && (
              <p className="mt-3 text-sm text-gray-600">
                Total: <strong>{totalAmount === 0 ? "Free" : `₹${totalAmount}`}</strong>
              </p>
            )}
          </div>
        )}

        {bookingError && (
          <p className="text-red-500 text-sm mt-4">{bookingError}</p>
        )}

        {bookingSuccess && bookingSuccess.booking_status === "pending" && (
          <p className="text-amber-600 text-sm mt-4">
            Booking created — payment step coming soon. Reference: {bookingSuccess.booking_reference}
          </p>
        )}

        <button
          onClick={handleBookingClick}
          disabled={event.available_capacity === 0 || booking}
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {event.available_capacity === 0
            ? "Sold Out"
            : booking
            ? "Booking..."
            : "Book Ticket"}
        </button>
      </div>
    </div>
  );
};

export default EventDetail;