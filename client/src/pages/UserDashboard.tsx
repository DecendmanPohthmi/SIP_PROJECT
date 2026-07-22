import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BsTicketDetailed,
  BsCalendarCheck,
  BsBagCheck,
  BsClockHistory,
  BsCalendarEvent,
  BsGeoAlt,
  BsDownload,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type Booking = {
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  booking_reference: string;
  quantity: number;
  total_amount: string;
  booking_status: string;   // pending | confirmed | cancelled | refunded
  event_status: string;     // live | completed | cancelled (from events table)
  booking_date: string;
  title: string;
  event_date: string;
  city: string;
  ticket_name: string;
};

const UserDashboard = () => {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:4000/api/bookings/my-bookings", {
          headers: { token: token || "" },
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Could not load bookings.");
        }

        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookings();
  }, [token]);

  const isCancelledOrRefunded = (b: Booking) =>
    b.booking_status === "cancelled" || b.booking_status === "refunded";

  // Active bookings = booking itself wasn't cancelled/refunded by the user
  const activeBookings = bookings.filter((b) => !isCancelledOrRefunded(b));

  // Classify by the EVENT's own status (from the DB), not by date math
  const liveBookings = activeBookings
    .filter((b) => b.event_status === "live")
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const completedBookings = activeBookings.filter((b) => b.event_status === "completed");

  const totalBookings = activeBookings.length;
  const liveCount = liveBookings.length;
  const completedCount = completedBookings.length;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      cancelled: "bg-red-50 text-red-600",
      refunded: "bg-slate-100 text-slate-600",
    };

    return (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
          styles[status] || "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleDownload = async (e: React.MouseEvent, bookingId: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDownloadingId(bookingId);

      const res = await fetch(`http://localhost:4000/api/bookings/${bookingId}/qr`, {
        headers: { token: token || "" },
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Could not download ticket.");
      }

      const link = document.createElement("a");
      link.href = data.qr_image;
      link.download = `ticket-${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || "Could not download ticket.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Your Dashboard</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your events.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <BsBagCheck />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalBookings}</p>
            <p className="text-sm text-slate-500">Total Bookings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <BsCalendarCheck />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{liveCount}</p>
            <p className="text-sm text-slate-500">Live Events</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl">
            <BsClockHistory />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
            <p className="text-sm text-slate-500">Completed Events</p>
          </div>
        </div>
      </div>

      {/* Live (Upcoming) Bookings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Upcoming Bookings</h2>
        <Link to="/myBooking" className="text-sm text-indigo-600 font-semibold hover:underline">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading your bookings...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : liveBookings.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No upcoming bookings yet.{" "}
          <Link to="/" className="text-indigo-600 hover:underline">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {liveBookings.slice(0, 4).map((booking) => (
            <Link
              key={booking.booking_id}
              to={`/events/${booking.event_id}`}
              className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 block"
            >
              <div className="flex items-center justify-between mb-3">
                {statusBadge(booking.booking_status)}
                <BsTicketDetailed className="text-slate-300" size={18} />
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2 truncate">
                {booking.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1.5">
                <BsCalendarEvent size={13} />
                <span>{formatDate(booking.event_date)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <BsGeoAlt size={13} />
                <span className="truncate">{booking.city}</span>
              </div>

              {booking.booking_status === "confirmed" && (
                <button
                  onClick={(e) => handleDownload(e, booking.booking_id)}
                  disabled={downloadingId === booking.booking_id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  <BsDownload size={13} />
                  {downloadingId === booking.booking_id ? "Downloading..." : "Download Ticket"}
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;