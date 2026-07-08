import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

type EventType = {
  id?: string;
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
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:4000/api/events/${id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Event not found");
        }

        setEvent(data.event);
      } catch (err) {
        console.log(err);
        setError("Could not load this event.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBookingClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // token exists — proceed with booking
    console.log("Booking event:", event?.id);
    // call your booking API here
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
      <img
        src={event.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"}
        alt={event.title}
        className="w-full h-96 object-cover"
      />

      {/* Event Details */}
      <div className="p-8">

        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
          {event.category}
        </span>

        <h1 className="text-4xl font-bold mt-4">
          {event.title}
        </h1>

        <p className="text-gray-600 mt-4">
          {event.description}
        </p>

        <div className="mt-8 space-y-3">

          <p>
            <strong>Date:</strong> {event.event_date}
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
            <strong>Seats:</strong>{" "}
            {event.available_capacity} / {event.total_capacity}
          </p>

        </div>

        <button
          onClick={handleBookingClick}
          disabled={event.available_capacity === 0}
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {event.available_capacity === 0 ? "Sold Out" : "Book Ticket"}
        </button>

      </div>

    </div>
  );
};

export default EventDetail;