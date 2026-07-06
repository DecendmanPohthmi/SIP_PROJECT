import pool from "../config/db.js";

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
        (full_name,email,phone,password)

        VALUES($1,$2,$3,$4)

        RETURNING *`,

        [
            full_name,
            email,
            phone,
            password
        ]

    );

    return result.rows[0];

};