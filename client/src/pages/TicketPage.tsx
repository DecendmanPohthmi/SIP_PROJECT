import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { BsDownload, BsCheckCircleFill, BsArrowLeft } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import html2canvas from "html2canvas-pro";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type Booking = {
  booking_id: number;
  booking_reference: string;
  booking_status: string;
  quantity: number;
  total_amount: number;
  event_id: number;
  ticket_type_id: number;

  event_title?: string;
  event_date?: string;
  venue?: string;
  city?: string;
  ticket_name?: string;
};

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
  ticket_type_id?: number;
  ticket_name: string;
  price: number;
  available_quantity: number;
};

const TicketPage = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<EventType | null>(null);
  const [qrImage, setQrImage] = useState<string>("");
  const [ticketDetails, setTicketDetails] = useState<TicketType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch Booking Details
        const bookingRes = await fetch(
          `${API}/api/bookings/${id}`,
          { headers: { token: token || "" } },
        );
        const bookingData = await bookingRes.json();

        if (!bookingData.success || !bookingData.booking) {
          throw new Error(bookingData.message || "Booking not found.");
        }

        const currentBooking = bookingData.booking;
        setBooking(currentBooking);

        // 2. Fetch Event Details
        const targetEventId = currentBooking.event_id;
        if (targetEventId) {
          const res = await fetch(`${API}/api/events/${targetEventId}`);
          const eventData = await res.json();
          if (eventData.success) {
            setEvent(eventData.event);
          }
        }

        // 3. Fetch Ticket Type Name specifically
        const targetTicketId = currentBooking.ticket_type_id;
        if (targetTicketId && !currentBooking.ticket_name) {
          const res = await fetch(
            `${API}/api/events/ticket/${targetTicketId}`,
            { headers: { token: token || "" } }
          );
          const ticketData = await res.json();
          if (ticketData.success) {
            setTicketDetails(ticketData.ticket);
          }
        }

        // 4. Fetch QR Code Asset
        const qrRes = await fetch(
          `${API}/api/bookings/${id}/qr`,
          { headers: { token: token || "" } },
        );
        const qrData = await qrRes.json();
        if (qrData.success) {
          setQrImage(qrData.qr_image);
        }
      } catch (err: any) {
        setError(err.message || "Could not load your ticket.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchTicket();
  }, [token, id]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      setDownloading(true);
      setDownloadError("");

      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ticket-${booking?.booking_reference || id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error("Failed to download ticket:", err);
      setDownloadError(err?.message || "Could not generate ticket image.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 text-center text-slate-500 text-sm">
        Loading your ticket...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <p className="text-red-500 text-sm mb-4">{error || "Ticket not found."}</p>
        <Link to="/" className="text-indigo-600 font-medium text-sm hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-4 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-slate-800 mb-4 sm:mb-6 transition-colors"
      >
        <BsArrowLeft size={14} />
        Back to Home
      </Link>

      {/* Target Download Bounding Container */}
      <div
        ref={ticketRef}
        className="bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden p-0.5"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white p-5 sm:p-6 text-center rounded-t-2xl">
          <BsCheckCircleFill
            size={26}
            className="mx-auto mb-2 text-emerald-400"
          />
          <h1 className="text-base sm:text-lg font-bold">Booking Confirmed</h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Ref: {booking.booking_reference}
          </p>
        </div>

        {/* Dynamic Event Metadata Content */}
        <div className="p-5 sm:p-6 border-b border-dashed border-slate-200">
          <h2 className="font-bold text-slate-800 text-base sm:text-lg leading-snug">
            {event?.title || "Event"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{event?.event_date}</p>
          <p className="text-xs sm:text-sm text-slate-500">
            {event?.venue}, {event?.city}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 text-xs sm:text-sm">
            <div>
              <p className="text-slate-400">Ticket Type</p>
              <p className="font-semibold text-slate-800 truncate">
                {booking.ticket_name || ticketDetails?.ticket_name || "General"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Quantity</p>
              <p className="font-semibold text-slate-800">{booking.quantity}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Paid</p>
              <p className="font-semibold text-slate-800">
                {booking.total_amount === 0
                  ? "Free"
                  : `₹${booking.total_amount}`}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Status</p>
              <p className="font-semibold text-emerald-600 capitalize">
                {booking.booking_status}
              </p>
            </div>
          </div>
        </div>

        {/* QR Section Container */}
        <div className="p-5 sm:p-6 flex flex-col items-center bg-white rounded-b-2xl">
          {qrImage ? (
            <img src={qrImage} alt="Ticket QR Code" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
          ) : (
            <p className="text-slate-400 text-xs sm:text-sm">QR code unavailable.</p>
          )}
          <p className="text-[11px] sm:text-xs text-slate-400 mt-3 text-center">
            Show this QR code at the venue entrance for check-in.
          </p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={!qrImage || downloading}
        className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-2 bg-black text-white py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <BsDownload size={16} />
        {downloading ? "Preparing Image..." : "Download Ticket"}
      </button>

      {downloadError && (
        <p className="text-red-500 text-xs sm:text-sm text-center mt-2">{downloadError}</p>
      )}
    </div>
  );
};

export default TicketPage;