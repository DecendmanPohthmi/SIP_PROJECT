import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BsTicketPerforated,
  BsPlusCircle,
  BsPencilSquare,
  BsTrash,
  BsRocketTakeoff,
  BsArrowLeft,
  BsX,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

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

const ManageTickets = () => {
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

  const authHeaders = { token: token || "" };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`http://localhost:4000/api/organiser/tickets/${id}`, {
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
      const res = await fetch(`http://localhost:4000/api/events/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) setEventInfo(data.event);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchTickets();
      fetchEventInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmit = async () => {
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

        const res = await fetch(`http://localhost:4000/api/organiser/ticket/${editingId}`, {
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
        const res = await fetch(`http://localhost:4000/api/organiser/tickets`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: id,
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

  const handleDelete = async (ticket_type_id: number) => {
    if (!confirm("Delete this ticket type? This cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/organiser/ticket/${ticket_type_id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      fetchTickets();
    } catch (err: any) {
      alert(err.message || "Could not delete ticket.");
    }
  };

  const handlePublish = async () => {
    if (tickets.length === 0) {
      setPublishError("Add at least one ticket type before publishing.");
      return;
    }

    try {
      setPublishing(true);
      setPublishError("");

      const res = await fetch(`http://localhost:4000/api/events/publish/${id}`, {
        method: "PUT",
        headers: authHeaders,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Could not publish event.");

      navigate("/organiser/dashboard");
    } catch (err: any) {
      setPublishError(err.message || "Something went wrong.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-16">

      <Link
        to="/organiser/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <BsArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Ticket Types{eventInfo ? ` — ${eventInfo.title}` : ""}
          </h1>
          <p className="text-slate-500 mt-1">Add ticket tiers before publishing your event.</p>
        </div>

        <button
          onClick={openAddForm}
          disabled={remaining <= 0}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <BsPlusCircle size={16} />
          Add Ticket Type
        </button>
      </div>

      {/* Capacity Summary */}
      {eventInfo && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{eventInfo.total_capacity}</p>
            <p className="text-xs text-slate-500 mt-1">Total Capacity</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{allocated}</p>
            <p className="text-xs text-slate-500 mt-1">Allocated to Tickets</p>
          </div>
          <div className={`bg-white border rounded-xl p-4 text-center ${remaining <= 0 ? "border-amber-200" : "border-slate-100"}`}>
            <p className={`text-2xl font-bold ${remaining <= 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {remaining}
            </p>
            <p className="text-xs text-slate-500 mt-1">Remaining to Allocate</p>
          </div>
        </div>
      )}

      {remaining <= 0 && eventInfo && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
          All {eventInfo.total_capacity} seats have been allocated across your ticket types.
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading tickets...</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl text-slate-400">
          <BsTicketPerforated size={28} className="mx-auto mb-3" />
          No ticket types yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticket_type_id}
              className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <p className="font-bold text-slate-800">{ticket.ticket_name}</p>
                {ticket.description && (
                  <p className="text-sm text-slate-500">{ticket.description}</p>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  ₹{ticket.price} · {ticket.available_quantity}/{ticket.quantity} available · Max {ticket.max_tickets_per_person}/person
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(ticket)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                >
                  <BsPencilSquare size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ticket.ticket_type_id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                >
                  <BsTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-slate-800 mb-1">Ready to go live?</h2>
        <p className="text-sm text-slate-500 mb-4">
          Once published, attendees will be able to see and book this event.
        </p>

        {publishError && <p className="text-red-500 text-sm mb-3">{publishError}</p>}

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          <BsRocketTakeoff size={16} />
          {publishing ? "Publishing..." : "Publish Event"}
        </button>
      </div>

      {/* Add/Edit Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "Edit Ticket Type" : "Add Ticket Type"}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <BsX size={22} />
              </button>
            </div>

            {eventInfo && (
              <p className="text-xs text-slate-500 mb-4">
                {editingId
                  ? `You can allocate up to ${remaining + (tickets.find((t) => t.ticket_type_id === editingId)?.quantity || 0)} seats to this ticket type.`
                  : `${remaining} seat${remaining === 1 ? "" : "s"} available to allocate.`}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Ticket Name</label>
                <input
                  type="text"
                  value={form.ticket_name}
                  onChange={(e) => setForm({ ...form, ticket_name: e.target.value })}
                  placeholder="e.g. General Admission, VIP"
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What's included with this ticket?"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2.5 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="500"
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Sale Start</label>
                  <input
                    type="date"
                    value={form.sale_start}
                    onChange={(e) => setForm({ ...form, sale_start: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Sale End</label>
                  <input
                    type="date"
                    value={form.sale_end}
                    onChange={(e) => setForm({ ...form, sale_end: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Max Per Person</label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_tickets_per_person}
                    onChange={(e) => setForm({ ...form, max_tickets_per_person: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <label className="flex items-center gap-2 mb-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_refundable}
                    onChange={(e) => setForm({ ...form, is_refundable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Refundable</span>
                </label>
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Ticket"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageTickets;