import pool from "../config/db.js";

// Find admin by email
export const findAdminByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM admins WHERE email = $1",
    [email]
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