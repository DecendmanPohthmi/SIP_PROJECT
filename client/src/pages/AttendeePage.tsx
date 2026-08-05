import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Clock,
  Search,
  CheckCircle2,
  QrCode,
  Radio,
  ArrowLeft,
  Filter,
  X,
  Mail,
  Ticket,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

export default function LiveEventAttendeePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [attendees, setAttendees] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"attendees" | "waitlist">(
    "attendees",
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [eventstatus, setEventStatus] = useState("LIVE");
  const [eventCapacity, setEventCapacity] = useState({
    total_capacity: 0,
    available_capacity: 0,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [waitlistActionMsg, setWaitlistActionMsg] = useState<{
    id: string;
    text: string;
    type: "success" | "error";
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const token = localStorage.getItem("token");

  // Fetch event bookings, waitlist, and event capacity/status using the dynamic eventId from URL params
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        setLoading(true);

        // 1. Fetch bookings list
        const bookingsRes = await fetch(
          `${API}/api/bookings/event/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success) {
          setAttendees(bookingsData.bookings);
        }

        // 2. Fetch waitlist entries for this event
        const waitlistRes = await fetch(
          `${API}/api/bookings/event/${eventId}/waitlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const waitlistData = await waitlistRes.json();
        if (waitlistData.success) {
          setWaitlist(waitlistData.waitlist || []);
        }

        // 3. Fetch event details to get status and capacity stats
        const eventRes = await fetch(`${API}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventData = await eventRes.json();

        if (eventData.success) {
          const eventObj = eventData.event || eventData.data || eventData;
          const currentStatus = eventObj.status || "live";
          setEventStatus(currentStatus.toUpperCase());
          setEventCapacity({
            total_capacity: eventObj.total_capacity || 0,
            available_capacity: eventObj.available_capacity ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch bookings, waitlist, or event info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, token]);

  // Initialize QR Code Scanner
  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          await handleScanCheckIn(decodedText);
        },
        () => {},
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning]);

  // Submit scanned QR token to backend controller using PUT
  const handleScanCheckIn = async (qr_token: string) => {
    try {
      const res = await fetch(`${API}/api/bookings/scan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_token: qr_token.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setScanMessage({ type: "success", text: data.message });
        setAttendees((prev) =>
          prev.map((item) =>
            item.booking_id === data.booking.booking_id ? data.booking : item,
          ),
        );
      } else {
        setScanMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setScanMessage({
        type: "error",
        text: "Network error during scan processing.",
      });
    }
  };

  // Update waitlist entry status locally and persist via API
  const handleUpdateWaitlistStatus = async (
    waitlist_id: string,
    newStatus: string,
  ) => {
    try {
      const res = await fetch(
        `${API}/api/bookings/waitlist/${waitlist_id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();

      if (data.success || res.ok) {
        setWaitlist((prev) =>
          prev.map((item) =>
            item.waitlist_id === waitlist_id
              ? { ...item, status: newStatus }
              : item,
          ),
        );
        setWaitlistActionMsg({
          id: waitlist_id,
          text: "Status updated!",
          type: "success",
        });
      } else {
        setWaitlistActionMsg({
          id: waitlist_id,
          text: data.message || "Failed to update status",
          type: "error",
        });
      }
    } catch (err) {
      setWaitlistActionMsg({
        id: waitlist_id,
        text: "Network error updating status",
        type: "error",
      });
    } finally {
      setTimeout(() => setWaitlistActionMsg(null), 3000);
    }
  };

  // Trigger seat availability notification email to the waitlisted user
  const handleNotifySeatAvailable = async (
    waitlist_id: string,
    userEmail: string,
  ) => {
    try {
      await handleUpdateWaitlistStatus(waitlist_id, "notified");

      const res = await fetch(`${API}/api/bookings/waitlist/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          waitlist_id,
          email: userEmail,
          event_id: eventId,
        }),
      });
      const data = await res.json();

      if (data.success || res.ok) {
        setWaitlistActionMsg({
          id: waitlist_id,
          text: `Seat alert sent to ${userEmail}!`,
          type: "success",
        });
      } else {
        setWaitlistActionMsg({
          id: waitlist_id,
          text: data.message || "Failed to send notification email",
          type: "error",
        });
      }
    } catch (err) {
      setWaitlistActionMsg({
        id: waitlist_id,
        text: "Network error sending email",
        type: "error",
      });
    } finally {
      setTimeout(() => setWaitlistActionMsg(null), 4000);
    }
  };

  const totalCheckedIn = attendees.filter((a) => a.is_checked_in).length;
  const totalRegistered = attendees.length;

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.booking_reference
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      attendee.ticket_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "checked_in")
      return matchesSearch && attendee.is_checked_in;
    if (filterStatus === "pending")
      return matchesSearch && !attendee.is_checked_in;
    return matchesSearch;
  });

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-red-50 text-red-600 border-red-200 animate-pulse";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Event Check-In Dashboard
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeStyles(eventstatus)}`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  {eventstatus}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Scan attendee ticket passes and monitor seat allocation (Event
                ID: {eventId})
              </p>
            </div>
          </div>

          {eventstatus === "LIVE" && activeTab === "attendees" && (
            <button
              onClick={() => {
                setIsScanning(true);
                setScanMessage(null);
              }}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4" />
              Scan QR Code
            </button>
          )}
        </div>

        {/* Metrics Cards (Including Seat Availability) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Available Seats
              </p>
              <h3 className="text-2xl font-bold text-violet-600">
                {eventCapacity.available_capacity}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / {eventCapacity.total_capacity}
                </span>
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Bookings
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {totalRegistered}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Checked-In</p>
              <h3 className="text-2xl font-bold text-emerald-600">
                {totalCheckedIn}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-bold text-amber-600">
                {totalRegistered - totalCheckedIn}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs for switching between Attendees and Waitlist */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-2">
          <button
            onClick={() => setActiveTab("attendees")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "attendees"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Confirmed Attendees ({attendees.length})
          </button>
          <button
            onClick={() => setActiveTab("waitlist")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "waitlist"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Waitlist Queue ({waitlist.length})
          </button>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeTab === "waitlist" ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                Manage waitlist queue statuses and notify users when spots open
                up.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Status Update</th>
                    <th className="py-3.5 px-4">Joined At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        Loading waitlist...
                      </td>
                    </tr>
                  ) : waitlist.length > 0 ? (
                    waitlist.map((item, index) => {
                      const waitlistId = item.waitlist_id || index;
                      return (
                        <tr
                          key={waitlistId}
                          className="hover:bg-slate-50/85 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">
                              {item.full_name || "Guest User"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.email}
                            </p>
                            {waitlistActionMsg &&
                              waitlistActionMsg.id === item.waitlist_id && (
                                <p
                                  className={`text-xs mt-1 font-medium ${waitlistActionMsg.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {waitlistActionMsg.text}
                                </p>
                              )}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={item.status || "waiting"}
                              onChange={(e) =>
                                handleUpdateWaitlistStatus(
                                  item.waitlist_id,
                                  e.target.value,
                                )
                              }
                              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="waiting">Waiting</option>
                              <option value="notified">Notified</option>
                              <option value="converted">Converted</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {new Date(item.created_at).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() =>
                                handleNotifySeatAvailable(
                                  item.waitlist_id,
                                  item.email,
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors border border-indigo-200 shadow-sm"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Notify Seat Available
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-slate-400"
                      >
                        No users currently on the waitlist.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search attendee by name, email, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 mr-1 hidden md:block" />
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${filterStatus === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("checked_in")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${filterStatus === "checked_in" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  Checked In ({totalCheckedIn})
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${filterStatus === "pending" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  Pending ({totalRegistered - totalCheckedIn})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-3.5 px-4">Attendee Details</th>
                    <th className="py-3.5 px-4">Ticket Type</th>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Checked In At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400"
                      >
                        Loading bookings...
                      </td>
                    </tr>
                  ) : filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee) => (
                      <tr
                        key={attendee.booking_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">
                            {attendee.full_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {attendee.email} • Qty: {attendee.quantity}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {attendee.ticket_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {attendee.booking_reference}
                        </td>
                        <td className="py-3.5 px-4">
                          {attendee.is_checked_in ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                              In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />{" "}
                              {attendee.booking_status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {attendee.checked_in_at
                            ? new Date(
                                attendee.checked_in_at,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-slate-400"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal Popup */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Scan QR Pass</h3>
              <button
                onClick={() => setIsScanning(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              id="reader"
              className="overflow-hidden rounded-xl border border-slate-200"
            ></div>

            {scanMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold text-center ${scanMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
              >
                {scanMessage.text}
              </div>
            )}

            <button
              onClick={() => setIsScanning(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
