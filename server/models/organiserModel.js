import pool from "../config/db.js";

export const findOrganiserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM organisers WHERE email=$1",
        [email]
    );

    return result.rows[0];
};

export const createOrganiser = async (
    full_name,
    organisation_name,
    email,
    phone,
    password
) => {

    const result = await pool.query(

        `INSERT INTO organisers
        (full_name, organisation_name, email, phone, password)

        VALUES($1,$2,$3,$4,$5)

        RETURNING *`,

        [
            full_name,
            organisation_name,
            email,
            phone,
            password
        ]

    );

    return result.rows[0];

};

export const pendingOrganiser = async () => {
    const result = await pool.query(
        `SELECT
            organiser_id,
            full_name,
            organisation_name,
            email,
            phone,
            status,
            created_at

         FROM organisers

         WHERE status='pending'

         ORDER BY created_at ASC`
    );

    return result.rows;
};

export const findOrganiserById = async (organiser_id) => {
    const result = await pool.query(
        `SELECT
            organiser_id,
            full_name,
            organisation_name,
            email,
            phone,
            status,
            rejection_reason,
            created_at

         FROM organisers

         WHERE organiser_id=$1`,
        [organiser_id]
    );

    return result.rows[0];
};

export const approveOrganiser = async (organiser_id) => {
    const result = await pool.query(
        `UPDATE organisers

         SET
         status='approved',
         updated_at=CURRENT_TIMESTAMP

         WHERE organiser_id=$1

         RETURNING organiser_id, full_name, organisation_name, email, status`,
        [organiser_id]
    );

    return result.rows[0];
};

export const rejectOrganiser = async (organiser_id, reason) => {
    const result = await pool.query(
        `UPDATE organisers

         SET
         status='rejected',
         rejection_reason=$1,
         updated_at=CURRENT_TIMESTAMP

         WHERE organiser_id=$2

         RETURNING organiser_id, full_name, organisation_name, email, status, rejection_reason`,
        [reason, organiser_id]
    );

    return result.rows[0];
};

export const deleteOrganiser = async (organiser_id) => {
    const result = await pool.query(
        `DELETE FROM organisers

         WHERE organiser_id=$1

         RETURNING organiser_id`,
        [organiser_id]
    );

    return result.rows[0];
};