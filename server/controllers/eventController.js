import {
  createEvent,
  getAllEvents,
  getLivedEvents,
  getEventsByStatus,
  searchEventsByOrganiser,
  getEventById,
  getEventsByOrganiser,
  getOrganiserEventsByStatus,
  updateEvent,
  approveEvent,
  rejectEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  deleteEvent,
} from "../models/eventModel.js";

// ================= CREATE EVENT =================

export const addEvent = async (req, res) => {
  try {
    const organiser_id = req.user.id;

    const {
      title,
      description,
      category,
      venue,
      city,
      event_date,
      start_time,
      end_time,
      total_capacity,
      pricing_mode,
    } = req.body;

    const image_url = req.file ? req.file.path : null; // Cloudinary URL

    const event = await createEvent(
      organiser_id,
      title,
      description,
      category,
      venue,
      city,
      event_date,
      start_time,
      end_time,
      total_capacity,
      total_capacity,
      pricing_mode,
      image_url
    );

    res.status(201).json({
      success: true,
      message: "Event submitted successfully. Waiting for admin approval.",
      event,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET ALL EVENTS (admin) =================

export const fetchAllEvents = async (req, res) => {
  try {
    const events = await getAllEvents();

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET LIVE EVENTS (public/attendee) =================

export const fetchLivedEvents = async (req, res) => {
  try {
    const events = await getLivedEvents();

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET EVENTS BY STATUS (admin) =================
// GET /api/events/status/:status  -> pending | approved | live | rejected | completed | cancelled

export const fetchEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["pending", "approved", "live", "rejected", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const events = await getEventsByStatus(status);

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= SEARCH EVENTS BY ORGANISER (admin) =================
// GET /api/events/search?q=xyz

export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query required." });
    }

    const events = await searchEventsByOrganiser(q);

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET EVENT BY ID =================

export const fetchEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET ORGANISER EVENTS (own, all statuses) =================

export const fetchMyEvents = async (req, res) => {
  try {
    const organiser_id = req.user.id;

    const events = await getEventsByOrganiser(organiser_id);

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET ORGANISER'S EVENTS BY STATUS =================
// GET /api/events/my-events/status/:status

export const fetchMyEventsByStatus = async (req, res) => {
  try {
    const organiser_id = req.user.id;
    const { status } = req.params;
    const validStatuses = ["pending", "approved", "live", "rejected", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const events = await getOrganiserEventsByStatus(organiser_id, status);

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= UPDATE EVENT =================

export const editEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      venue,
      city,
      event_date,
      start_time,
      end_time,
      total_capacity,
      available_capacity,
      pricing_mode,
    } = req.body;

    const existing = await getEventById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    if (existing.organiser_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this event." });
    }

    const image_url = req.file ? req.file.path : null;

    const event = await updateEvent(
      id,
      title,
      description,
      category,
      venue,
      city,
      event_date,
      start_time,
      end_time,
      total_capacity,
      available_capacity,
      pricing_mode,
      image_url
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= APPROVE EVENT (admin) =================

export const approveEventByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await approveEvent(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event approved successfully.",
      event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= REJECT EVENT (admin) =================

export const rejectEventByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const event = await rejectEvent(id, reason);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event rejected successfully.",
      event,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= PUBLISH EVENT — GO LIVE (organiser) =================

export const goLive = async (req, res) => {
  try {
    const { id } = req.params;
    const organiser_id = req.user.id;

    const event = await publishEvent(id, organiser_id);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Event must be approved and owned by you to go live.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event is now live!",
      event,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= CANCEL EVENT (organiser) =================

export const cancelEventByOrganiser = async (req, res) => {
  try {
    const { id } = req.params;
    const organiser_id = req.user.id;

    const event = await cancelEvent(id, organiser_id);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Only your own live events can be cancelled.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event cancelled.",
      event,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= MARK EVENT COMPLETED (admin) =================

export const completeEventByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await completeEvent(id);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Only live events can be marked completed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event marked completed.",
      event,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= DELETE EVENT (admin or owning organiser) =================

export const removeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getEventById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }
    if (req.user.role !== "admin" && existing.organiser_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event.",
      });
    }

    await deleteEvent(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};