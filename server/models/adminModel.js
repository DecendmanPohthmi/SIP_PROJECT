import pool from "../config/db.js";

// Find admin by email
export const findAdminByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM admins WHERE email = $1",
    [email]
  );

  return result.rows[0];
};

// Find admin by ID
export const findById = async (adminId) => {
  const result = await pool.query(
    `SELECT admin_id, full_name, email, phone, created_at 
     FROM admins 
     WHERE admin_id = $1`,
    [adminId]
  );

  return result.rows[0];
};

// Update admin profile details
export const updateProfile = async (adminId, full_name, phone) => {
  const result = await pool.query(
    `UPDATE admins 
     SET full_name = $1, phone = $2 
     WHERE admin_id = $3 
     RETURNING admin_id, full_name, email, phone, created_at`,
    [full_name, phone || null, adminId]
  );

  return result.rows[0];
};

// Create admin
export const createAdmin = async (
  full_name,
  email,
  phone,
  password
) => {

  const result = await pool.query(

    `INSERT INTO admins
    (full_name,email,phone,password)

    VALUES($1,$2,$3,$4)

    RETURNING *`,

    [full_name,email,phone,password]

  );

  return result.rows[0];
};

export const getInfo = async () => {
  const result = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN owner_type = 'admin' THEN total_balance ELSE 0 END), 0) AS admin_total_balance,
       COALESCE(SUM(CASE WHEN owner_type = 'admin' THEN withdrawn_amount ELSE 0 END), 0) AS admin_withdrawn,
       COALESCE(SUM(CASE WHEN owner_type = 'organizer' THEN total_balance ELSE 0 END), 0) AS organizer_total_balance,
       COALESCE(SUM(CASE WHEN owner_type = 'organizer' THEN withdrawn_amount ELSE 0 END), 0) AS organizer_withdrawn
     FROM wallets`
  );
  
  return result.rows[0];
};