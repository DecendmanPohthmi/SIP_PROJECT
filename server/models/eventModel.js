import pool from "../config/db.js";

// ================= CREATE EVENT =================

export const createEvent = async (
  organiser_id, title, description, category, venue, city,
  event_date, start_time, end_time, total_capacity, available_capacity,
  pricing_mode, image_url = null
) => {
  const result = await pool.query(
    `INSERT INTO events
      (organiser_id, title, description, category, venue, city, event_date, start_time, end_time, total_capacity, available_capacity, pricing_mode, image_url, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending', NOW(), NOW())
     RETURNING *`,
    [organiser_id, title, description, category, venue, city, event_date, start_time, end_time, total_capacity, available_capacity, pricing_mode, image_url]
  );
  return result.rows[0];
};

// ================= GET ALL EVENTS (admin) =================

export const getAllEvents = async () => {
  const result = await pool.query(
    `SELECT e.*, o.full_name, o.organisation_name
     FROM events e JOIN organisers o ON e.organiser_id = o.organiser_id
     ORDER BY e.created_at DESC`
  );
  return result.rows;
};

// ================= GET LIVE EVENTS (attendees) =================

export const getLivedEvents = async () => {
  const result = await pool.query(
    `SELECT e.*, o.full_name, o.organisation_name
     FROM events e JOIN organisers o ON e.organiser_id = o.organiser_id
     WHERE e.status='live'
     ORDER BY event_date ASC`
  );
  return result.rows;
};

// ================= GET EVENTS BY STATUS (admin — any status) =================

export const getEventsByStatus = async (status) => {
  const result = await pool.query(
    `SELECT e.*, o.full_name, o.organisation_name
     FROM events e JOIN organisers o ON e.organiser_id = o.organiser_id
     WHERE e.status=$1
     ORDER BY e.updated_at DESC`,
    [status]
  );
  return result.rows;
};

// ================= SEARCH EVENTS (admin — by organiser name/org name/id) =================

export const searchEventsByOrganiser = async (query) => {
  const result = await pool.query(
    `SELECT e.*, o.full_name, o.organisation_name
     FROM events e JOIN organisers o ON e.organiser_id = o.organiser_id
     WHERE o.full_name ILIKE $1
        OR o.organisation_name ILIKE $1
        OR o.organiser_id::text = $2
     ORDER BY e.created_at DESC`,
    [`%${query}%`, query]
  );
  return result.rows;
};

// ================= GET EVENT BY ID =================

export const getEventById = async (id) => {
  const result = await pool.query(
    `SELECT e.*, o.full_name, o.organisation_name
     FROM events e JOIN organisers o ON e.organiser_id=o.organiser_id
     WHERE event_id=$1`,
    [id]
  );
  return result.rows[0];
};

// ================= GET EVENTS OF ORGANISER (all statuses) =================

export const getEventsByOrganiser = async (organiser_id) => {
  const result = await pool.query(
    `SELECT * FROM events WHERE organiser_id=$1 ORDER BY created_at DESC`,
    [organiser_id]
  );
  return result.rows;
};

// ================= GET ORGANISER'S EVENTS BY STATUS =================

export const getOrganiserEventsByStatus = async (organiser_id, status) => {
  const result = await pool.query(
    `SELECT * FROM events WHERE organiser_id=$1 AND status=$2 ORDER BY updated_at DESC`,
    [organiser_id, status]
  );
  return result.rows;
};

// ================= UPDATE EVENT =================

export const updateEvent = async (
  event_id, title, description, category, venue, city,
  event_date, start_time, end_time, total_capacity, available_capacity,
  pricing_mode, image_url = null
) => {
  const result = await pool.query(
    `UPDATE events SET
     title=$1, description=$2, category=$3, venue=$4, city=$5,
     event_date=$6, start_time=$7, end_time=$8, total_capacity=$9,
     available_capacity=$10, pricing_mode=$11, image_url=COALESCE($12, image_url),
     updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$13
     RETURNING *`,
    [title, description, category, venue, city, event_date, start_time, end_time, total_capacity, available_capacity, pricing_mode, image_url, event_id]
  );
  return result.rows[0];
};

// ================= APPROVE EVENT =================

export const approveEvent = async (event_id) => {
  const result = await pool.query(
    `UPDATE events SET status='approved', updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$1 RETURNING *`,
    [event_id]
  );
  return result.rows[0];
};

// ================= REJECT EVENT =================

export const rejectEvent = async (event_id, reason) => {
  const result = await pool.query(
    `UPDATE events SET status='rejected', rejection_reason=$1, updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$2 RETURNING *`,
    [reason, event_id]
  );
  return result.rows[0];
};

// ================= PUBLISH EVENT (organiser: approved -> live) =================

export const publishEvent = async (event_id, organiser_id) => {
  const result = await pool.query(
    `UPDATE events SET status='live', updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$1 AND organiser_id=$2 AND status='approved'
     RETURNING *`,
    [event_id, organiser_id]
  );
  return result.rows[0];
};

// ================= CANCEL EVENT (organiser: live -> cancelled) =================

export const cancelEvent = async (event_id, organiser_id) => {
  const result = await pool.query(
    `UPDATE events SET status='cancelled', updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$1 AND organiser_id=$2 AND status='live'
     RETURNING *`,
    [event_id, organiser_id]
  );
  return result.rows[0];
};

// ================= MARK EVENT COMPLETED (system/admin: live -> completed) =================

export const completeEvent = async (event_id) => {
  const result = await pool.query(
    `UPDATE events SET status='completed', updated_at=CURRENT_TIMESTAMP
     WHERE event_id=$1 AND status='live'
     RETURNING *`,
    [event_id]
  );
  return result.rows[0];
};

// ================= DELETE EVENT =================

export const deleteEvent = async (event_id) => {
  const result = await pool.query(
    `DELETE FROM events WHERE event_id=$1 RETURNING *`,
    [event_id]
  );
  return result.rows[0];
};