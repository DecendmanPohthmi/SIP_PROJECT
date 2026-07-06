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