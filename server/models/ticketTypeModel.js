import pool from "../config/db.js";

// ================= CREATE TICKET TYPE =================

export const createTicketType = async (
  event_id,
  ticket_name,
  description,
  price,
  quantity,
  available_quantity,
  sale_start,
  sale_end,
  max_tickets_per_person,
  is_refundable
) => {
  const result = await pool.query(
    `INSERT INTO ticket_types
    (
      event_id,
      ticket_name,
      description,
      price,
      quantity,
      available_quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      event_id,
      ticket_name,
      description,
      price,
      quantity,
      available_quantity,
      sale_start,
      sale_end,
      max_tickets_per_person,
      is_refundable,
    ]
  );

  return result.rows[0];
};

// ================= GET TICKET TYPES BY EVENT =================

export const getTicketTypesByEvent = async (event_id) => {
  const result = await pool.query(
    `SELECT *
     FROM ticket_types
     WHERE event_id = $1
     ORDER BY price ASC`,
    [event_id]
  );

  return result.rows;
};

// ================= GET TICKET TYPE BY ID =================

export const getTicketTypeById = async (ticket_type_id) => {
  const result = await pool.query(
    `SELECT *
     FROM ticket_types
     WHERE ticket_type_id = $1`,
    [ticket_type_id]
  );

  return result.rows[0];
};

// ================= UPDATE TICKET TYPE =================

export const updateTicketType = async (
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
) => {
  const result = await pool.query(
    `UPDATE ticket_types
     SET
        ticket_name = $1,
        description = $2,
        price = $3,
        quantity = $4,
        available_quantity = $5,
        sale_start = $6,
        sale_end = $7,
        max_tickets_per_person = $8,
        is_refundable = $9,
        status = $10,
        updated_at = CURRENT_TIMESTAMP
     WHERE ticket_type_id = $11
     RETURNING *`,
    [
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
      ticket_type_id,
    ]
  );

  return result.rows[0];
};

// ================= UPDATE AVAILABLE QUANTITY =================

export const updateAvailableQuantity = async (
  ticket_type_id,
  available_quantity
) => {
  const result = await pool.query(
    `UPDATE ticket_types
     SET
        available_quantity = $1,
        updated_at = CURRENT_TIMESTAMP
     WHERE ticket_type_id = $2
     RETURNING *`,
    [available_quantity, ticket_type_id]
  );

  return result.rows[0];
};

// ================= DELETE TICKET TYPE =================

export const deleteTicketType = async (ticket_type_id) => {
  await pool.query(
    `DELETE FROM ticket_types
     WHERE ticket_type_id = $1`,
    [ticket_type_id]
  );
};