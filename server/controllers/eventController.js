import {
  createEvent,
  getAllEvents,
  getApprovedEvents,
  getPendingEvents,
  getEventById,
  getEventsByOrganiser,
  updateEvent,
  approveEvent,
  rejectEvent,
  deleteEvent,
} from "../models/eventModel.js";

// ================= CREATE EVENT =================

export const addEvent = async (req, res) => {
  try {
    const organiser_id = req.user.id; // From JWT middleware

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
      pricing_mode
    );

    res.status(201).json({
      success: true,
      message: "Event submitted successfully. Waiting for admin approval.",
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

// ================= GET ALL EVENTS =================

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

// ================= GET APPROVED EVENTS =================

export const fetchApprovedEvents = async (req, res) => {
  try {
    const events = await getApprovedEvents();

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

// ================= GET PENDING EVENTS =================

export const fetchPendingEvents = async (req, res) => {
  try {
    const events = await getPendingEvents();

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

// ================= GET ORGANISER EVENTS =================

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
      pricing_mode
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

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

// ================= APPROVE EVENT =================

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

// ================= REJECT EVENT =================

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

// ================= DELETE EVENT =================

export const removeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await deleteEvent(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

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