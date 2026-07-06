import React from "react";

const EventDetail = () => {

  const event = {
    title: "Tech Conference 2026",
    category: "Technology",
    description:
      "Join industry experts and developers for an exciting day of learning, networking, and innovation.",
    date: "15 August 2026",
    location: "Shillong",
    ticketPrice: 500,
    availableSeats: 45,
    totalSeats: 100,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-lg rounded-xl overflow-hidden">

      {/* Event Image */}

      <img
        src={event.image}
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
            <strong>Date:</strong> {event.date}
          </p>

          <p>
            <strong>Location:</strong> {event.location}
          </p>

          <p>
            <strong>Price:</strong>{" "}
            {event.ticketPrice === 0 ? "FREE" : `₹${event.ticketPrice}`}
          </p>

          <p>
            <strong>Seats:</strong>{" "}
            {event.availableSeats} / {event.totalSeats}
          </p>

        </div>

        <button
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Book Ticket
        </button>

      </div>

    </div>
  );
};

export default EventDetail;