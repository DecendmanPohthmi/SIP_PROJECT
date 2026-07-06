import React from "react";
import { Link } from "react-router-dom";

const UserDashboard = () => {

  const user = {
    name: "John Doe"
  };

  const bookings = [
    {
      id: 1,
      title: "Tech Conference 2026",
      date: "15 August 2026",
      amount: 500,
      status: "Confirmed"
    },
    {
      id: 2,
      title: "Music Festival",
      date: "20 August 2026",
      amount: 0,
      status: "Pending"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">

      {/* Welcome */}

      <div className="bg-white shadow rounded-lg p-6 mb-8">

        <h1 className="text-3xl font-bold">
          Welcome, {user.name}
        </h1>

        <p className="text-gray-500 mt-2">
          User Dashboard
        </p>

      </div>

      {/* My Bookings */}

      <h2 className="text-2xl font-bold mb-6">
        My Bookings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {bookings.map((booking) => (

          <div
            key={booking.id}
            className="bg-white shadow rounded-lg p-6"
          >

            <h3 className="text-xl font-bold">
              {booking.title}
            </h3>

            <p className="mt-3">
              <strong>Date:</strong> {booking.date}
            </p>

            <p>
              <strong>Price:</strong>{" "}
              {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
            </p>

            <p>
              <strong>Status:</strong> {booking.status}
            </p>

            <div className="flex justify-between mt-6">

              <Link
                to="/events"
                className="text-blue-600"
              >
                View Event
              </Link>

              <button className="text-red-600">
                Cancel
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default UserDashboard;