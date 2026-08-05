import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BsTicketPerforated,
  BsPlusCircle,
  BsTrash,
  BsPencilSquare,
  BsRocketTakeoff,
  BsArrowLeft,
  BsX,
  BsXCircleFill as BsXCircleFillIcon,
} from "react-icons/bs";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

type TicketType = {
  ticket_type_id: number;
  event_id: number;
  ticket_name: string;
  description: string;
  price: number;
  quantity: number;
  available_quantity: number;
  sale_start: string;
  sale_end: string;
  max_tickets_per_person: number;
  is_refundable: boolean;
  status?: string;
};

type EventInfo = {
  event_id: number;
  title: string;
  total_capacity: number;
};

const emptyForm = {
  ticket_name: "",
  description: "",
  price: "",
  quantity: "",
  sale_start: "",
  sale_end: "",
  max_tickets_per_person: "4",
  is_refundable: false,
};

export const ManageTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    token: token || "",
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/organiser/tickets/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Could not load tickets");
      setTickets(data.tickets || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventInfo = async () => {
    try {
      const res = await fetch(`${API}/api/events/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) setEventInfo(data.event);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchTickets();
      fetchEventInfo();
    }
  }, [token, id]);

  const allocated = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const remaining = eventInfo ? eventInfo.total_capacity - allocated : 0;

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (ticket: TicketType) => {
    setEditingId(ticket.ticket_type_id);
    setForm({
      ticket_name: ticket.ticket_name,
      description: ticket.description || "",
      price: String(ticket.price),
      quantity: String(ticket.quantity),
      sale_start: ticket.sale_start?.slice(0, 10) || "",
      sale_end: ticket.sale_end?.slice(0, 10) || "",
      max_tickets_per_person: String(ticket.max_tickets_per_person || 4),
      is_refundable: ticket.is_refundable,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.ticket_name || !form.price || !form.quantity || !form.sale_start || !form.sale_end) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (eventInfo) {
      const currentTicketQty = editingId
        ? tickets.find((t) => t.ticket_type_id === editingId)?.quantity || 0
        : 0;
      const allocatedExcludingThis = allocated - currentTicketQty;
      const availableRoom = eventInfo.total_capacity - allocatedExcludingThis;

      if (Number(form.quantity) > availableRoom) {
        setFormError(
          `Only ${availableRoom} seats available for this ticket type (event capacity: ${eventInfo.total_capacity}).`
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const existing = tickets.find((t) => t.ticket_type_id === editingId);

        const res = await fetch(`${API}/api/organiser/ticket/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_name: form.ticket_name,
            description: form.description,
            price: Number(form.price),
            quantity: Number(form.quantity),
            available_quantity: existing?.available_quantity ?? Number(form.quantity),
            sale_start: form.sale_start,
            sale_end: form.sale_end,
            max_tickets_per_person: Number(form.max_tickets_per_person),
            is_refundable: form.is_refundable,
            status: existing?.status || "active",
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Could not update ticket.");
      } else {
        const res = await fetch(`${API}/api/organiser/tickets`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: Number(id),
            ticket_name: form.ticket_name,
            description: form.description,
            price: Number(form.price),
            quantity: Number(form.quantity),
            sale_start: form.sale_start,
            sale_end: form.sale_end,
            max_tickets_per_person: Number(form.max_tickets_per_person),
            is_refundable: form.is_refundable,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Could not add ticket.");
      }

      closeForm();
      fetchTickets();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (!window.confirm("Are you sure you want to delete this ticket tier?")) return;

    try {
      const res = await fetch(`${API}/api/organiser/ticket/${ticketId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Could not delete ticket.");
      fetchTickets();
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    }
  };

  const handlePublish = async () => {
    setPublishError("");
    
    if (tickets.length === 0) {
      setPublishError("You must add at least one ticket tier before going live.");
      return;
    }

    if (allocated <= 0) {
      setPublishError("Your ticket tiers must have a valid quantity greater than 0 before publishing.");
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch(`${API}/api/events/publish/${id}`, {
        method: "PUT",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to publish event.");

      navigate("/organiser/dashboard");
    } catch (err: any) {
      setPublishError(err.message || "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back navigation */}
        <Link
          to="/organiser/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <BsArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {eventInfo?.title || "Event Management"}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Manage Ticket Tiers</h1>
            <p className="text-xs text-slate-500 mt-1">
              Setup pricing, available quantities, and sales dates prior to publishing live.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <BsPlusCircle size={14} /> Add Ticket Tier
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md shadow-red-200 disabled:opacity-50"
            >
              <BsRocketTakeoff size={14} /> {publishing ? "Publishing..." : "Publish Event Live"}
            </button>
          </div>
        </div>

        {publishError && (
          <div className="bg-rose-50 text-rose-700 border border-rose-200/80 p-4 rounded-xl text-xs flex items-center gap-2">
            <BsXCircleFillIcon className="shrink-0" size={14} />
            <span>{publishError}</span>
          </div>
        )}

        {/* Capacity Overview Bar */}
        {eventInfo && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Event Capacity
              </span>
              <p className="text-lg font-bold text-slate-800">{eventInfo.total_capacity} Total Seats</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Allocated Tickets
              </span>
              <p className="text-lg font-bold text-indigo-600">{allocated} Seats</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unallocated Capacity
              </span>
              <p className={`text-lg font-bold ${remaining < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {remaining} Seats
              </p>
            </div>
          </div>
        )}

        {/* Modal/Form Container */}
        {showForm && (
          <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Ticket Tier" : "Create Ticket Tier"}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <BsX size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 text-rose-700 border border-rose-200/80 p-3 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Ticket Name *</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Pass, Early Bird"
                  value={form.ticket_name}
                  onChange={(e) => setForm({ ...form, ticket_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0 for free"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity Available *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Capacity limit"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sale Start Date *</label>
                <input
                  type="date"
                  value={form.sale_start}
                  onChange={(e) => setForm({ ...form, sale_start: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sale End Date *</label>
                <input
                  type="date"
                  value={form.sale_end}
                  onChange={(e) => setForm({ ...form, sale_end: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Per Order</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_tickets_per_person}
                  onChange={(e) => setForm({ ...form, max_tickets_per_person: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="refundable"
                  checked={form.is_refundable}
                  onChange={(e) => setForm({ ...form, is_refundable: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="refundable" className="font-semibold text-slate-700">
                  Tickets are Refundable
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Perks included, seating location details, etc."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100"
                >
                  {submitting ? "Saving..." : editingId ? "Update Tier" : "Create Tier"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Ticket List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl h-24 animate-pulse border border-slate-200/80" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-700 border border-rose-200/80 p-4 rounded-xl text-xs">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
            <BsTicketPerforated size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No ticket tiers created yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Add at least one tier (e.g. Free Entry, VIP, General Admission) to enable event publishing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_type_id}
                className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{ticket.ticket_name}</h3>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ${ticket.price}
                    </span>
                    {ticket.is_refundable && (
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Refundable
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{ticket.description || "No description provided."}</p>
                  <p className="text-[11px] text-slate-400">
                    Sales: {ticket.sale_start?.slice(0, 10)} to {ticket.sale_end?.slice(0, 10)} • Max {ticket.max_tickets_per_person} per user
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-semibold text-slate-400">Quantity</span>
                    <p className="text-sm font-bold text-slate-800">
                      {ticket.available_quantity} / {ticket.quantity} Left
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(ticket)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit Tier"
                    >
                      <BsPencilSquare size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.ticket_type_id)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Tier"
                    >
                      <BsTrash size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTickets;