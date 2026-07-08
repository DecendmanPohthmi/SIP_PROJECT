import pool from "../config/db.js";

// ================= CREATE EVENT =================

export const createEvent = async (
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
  available_capacity,
  pricing_mode
) => {
  const result = await pool.query(
    `INSERT INTO events
    (
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
      available_capacity,
      pricing_mode
    )

    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)

    RETURNING *`,
    [
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
      available_capacity,
      pricing_mode,
    ]
  );

  return result.rows[0];
};

// ================= GET ALL EVENTS =================

export const getAllEvents = async () => {
  const result = await pool.query(
    `SELECT
        e.*,
        o.full_name,
        o.organisation_name

     FROM events e

     JOIN organisers o
     ON e.organiser_id = o.organiser_id

     ORDER BY e.created_at DESC`
  );

  return result.rows;
};

// ================= GET ONLY APPROVED EVENTS =================

export const getApprovedEvents = async () => {
  const result = await pool.query(
    `SELECT
        e.*,
        o.full_name,
        o.organisation_name

     FROM events e

     JOIN organisers o
     ON e.organiser_id = o.organiser_id

     WHERE e.status='approved'

     ORDER BY event_date ASC`
  );

  return result.rows;
};

// ================= GET PENDING EVENTS =================

export const getPendingEvents = async () => {
  const result = await pool.query(
    `SELECT
        e.*,
        o.full_name,
        o.organisation_name

     FROM events e

     JOIN organisers o
     ON e.organiser_id = o.organiser_id

     WHERE e.status='pending'

     ORDER BY created_at ASC`
  );

  return result.rows;
};

// ================= GET EVENT BY ID =================

export const getEventById = async (id) => {
  const result = await pool.query(
    `SELECT
        e.*,
        o.full_name,
        o.organisation_name

     FROM events e

     JOIN organisers o
     ON e.organiser_id=o.organiser_id

     WHERE event_id=$1`,
    [id]
  );

  return result.rows[0];
};

// ================= GET EVENTS OF ORGANISER =================

export const getEventsByOrganiser = async (organiser_id) => {
  const result = await pool.query(
    `SELECT *

     FROM events

     WHERE organiser_id=$1

     ORDER BY created_at DESC`,
    [organiser_id]
  );

  return result.rows;
};

// ================= UPDATE EVENT =================

export const updateEvent = async (
  event_id,
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
) => {
  const result = await pool.query(
    `UPDATE events

     SET
     title=$1,
     description=$2,
     category=$3,
     venue=$4,
     city=$5,
     event_date=$6,
     start_time=$7,
     end_time=$8,
     total_capacity=$9,
     available_capacity=$10,
     pricing_mode=$11,
     updated_at=CURRENT_TIMESTAMP

     WHERE event_id=$12

     RETURNING *`,
    [
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
      event_id,
    ]
  );

  return result.rows[0];
};

// ================= APPROVE EVENT =================

export const approveEvent = async (event_id) => {
  const result = await pool.query(
    `UPDATE events

     SET
     status='approved',
     updated_at=CURRENT_TIMESTAMP

     WHERE event_id=$1

     RETURNING *`,
    [event_id]
  );

  return result.rows[0];
};

// ================= REJECT EVENT =================

export const rejectEvent = async (event_id, reason) => {
  const result = await pool.query(
    `UPDATE events

     SET
     status='rejected',
     rejection_reason=$1,
     updated_at=CURRENT_TIMESTAMP

     WHERE event_id=$2

     RETURNING *`,
    [reason, event_id]
  );

  return result.rows[0];
};

// ================= DELETE EVENT =================

export const deleteEvent = async (event_id) => {
  const result = await pool.query(
    `DELETE FROM events

     WHERE event_id=$1

     RETURNING *`,
    [event_id]
  );

  return result.rows[0];
};