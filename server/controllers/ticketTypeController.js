import {
  createTicketType,
  getTicketTypesByEvent,
  getTicketTypeById,
  updateTicketType,
  deleteTicketType,
} from "../models/ticketTypeModel.js";

// ================= CREATE TICKET TYPE =================

export const addTicketType = async (req, res) => {
  try {
    const {
      event_id,
      ticket_name,
      description,
      price,
      quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable,
    } = req.body;

    const ticket = await createTicketType(
      event_id,
      ticket_name,
      description,
      price,
      quantity,
      quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable
    );

    res.status(201).json({
      success: true,
      message: "Ticket type added successfully.",
      ticket,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= GET TICKETS OF AN EVENT =================

export const getEventTicketTypes = async (req, res) => {
  try {

    const { event_id } = req.params;

    const tickets = await getTicketTypesByEvent(event_id);

    res.json({
      success: true,
      tickets,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= GET SINGLE TICKET =================

export const getTicket = async (req, res) => {
  try {

    const { ticket_type_id } = req.params;

    const ticket = await getTicketTypeById(ticket_type_id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket type not found.",
      });
    }

    res.json({
      success: true,
      ticket,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= UPDATE TICKET =================

export const editTicketType = async (req, res) => {
  try {

    const { ticket_type_id } = req.params;

    const {
      ticket_name,
      description,
      price,
      quantity,
      available_quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable,
      status,
    } = req.body;

    const ticket = await updateTicketType(
      ticket_type_id,
      ticket_name,
      description,
      price,
      quantity,
      available_quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable,
      status
    );

    res.json({
      success: true,
      message: "Ticket updated successfully.",
      ticket,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= DELETE TICKET =================

export const removeTicketType = async (req, res) => {
  try {

    const { ticket_type_id } = req.params;

    await deleteTicketType(ticket_type_id);

    res.json({
      success: true,
      message: "Ticket type deleted successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};