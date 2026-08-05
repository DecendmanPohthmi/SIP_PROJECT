// models/userModel.js
import pool from "../config/db.js";

// ==========================================
// USER AUTH & PROFILE METHODS
// ==========================================

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return result.rows[0];
};

export const createUser = async (
  full_name,
  email,
  phone,
  password
) => {
  const result = await pool.query(
    `INSERT INTO users
    (full_name, email, phone, password)
    VALUES($1, $2, $3, $4)
    RETURNING *`,
    [full_name, email, phone, password]
  );
  return result.rows[0];
};

export const findUserById = async (user_id) => {
  const result = await pool.query(
    `SELECT
        user_id,
        full_name,
        email,
        phone,
        bank_name,
        bank_account_number,
        bank_ifsc_code,
        upi_id
     FROM users
     WHERE user_id=$1`,
    [user_id]
  );
  return result.rows[0];
};

export const updateUserProfile = async (user_id, full_name, phone) => {
  const result = await pool.query(
    `UPDATE users
     SET full_name=$1, phone=$2
     WHERE user_id=$3
     RETURNING user_id, full_name, email, phone`,
    [full_name, phone, user_id]
  );
  return result.rows[0];
};

export const updateUserBankDetails = async (
  user_id, bank_name, bank_account_number, bank_ifsc_code, upi_id
) => {
  const result = await pool.query(
    `UPDATE users
     SET bank_name=$1, bank_account_number=$2, bank_ifsc_code=$3, upi_id=$4
     WHERE user_id=$5
     RETURNING user_id, bank_name, bank_account_number, bank_ifsc_code, upi_id`,
    [bank_name, bank_account_number, bank_ifsc_code, upi_id, user_id]
  );
  return result.rows[0];
};


// ==========================================
// ADMIN DASHBOARD METHODS
// ==========================================

export const getUsers = async (search = "") => {
  let query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.created_at,
      COUNT(b.booking_id)::INTEGER AS booking_count,
      COALESCE(SUM(b.total_amount), 0)::NUMERIC(12,2) AS total_spent
    FROM users u
    LEFT JOIN bookings b ON u.user_id = b.user_id AND b.booking_status = 'confirmed'
  `;

  const values = [];

  if (search && search.trim() !== "") {
    query += ` WHERE LOWER(u.full_name) LIKE $1 OR LOWER(u.email) LIKE $1`;
    values.push(`%${search.trim().toLowerCase()}%`);
  }

  query += ` GROUP BY u.user_id ORDER BY u.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

export const getPlatformStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*)::INTEGER FROM users) AS total_users,
      (SELECT COUNT(*)::INTEGER FROM bookings WHERE booking_status = 'confirmed') AS total_bookings,
      (SELECT COALESCE(SUM(total_amount), 0)::NUMERIC(12,2) FROM bookings WHERE booking_status = 'confirmed') AS total_spent
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

export const getTopBookers = async (limit = 5) => {
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.created_at,
      COUNT(b.booking_id)::INTEGER AS booking_count,
      COALESCE(SUM(b.total_amount), 0)::NUMERIC(12,2) AS total_spent
    FROM users u
    INNER JOIN bookings b ON u.user_id = b.user_id AND b.booking_status = 'confirmed'
    GROUP BY u.user_id
    ORDER BY booking_count DESC, total_spent DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};