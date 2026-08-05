import pool from "../config/db.js";

export const findOrganiserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM organisers WHERE email=$1", [
    email,
  ]);
  return result.rows[0];
};

export const createOrganiser = async (
  full_name,
  organisation_name,
  email,
  phone,
  password,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const organiserResult = await client.query(
      `INSERT INTO organisers
            (full_name, organisation_name, email, phone, password)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *`,
      [full_name, organisation_name, email, phone, password],
    );

    const newOrganiser = organiserResult.rows[0];

    await client.query(
      `INSERT INTO wallets (owner_type, owner_id, total_balance, withdrawn_amount, currency)
            VALUES ($1, $2, 0.00, 0.00, 'INR')`,
      ["organizer", newOrganiser.organiser_id],
    );

    await client.query("COMMIT");
    return newOrganiser;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
         ORDER BY created_at ASC`,
  );
  return result.rows;
};

export const findOrganiserById = async (organiser_id) => {
  const result = await pool.query(
    `SELECT
            o.organiser_id,
            o.full_name,
            o.organisation_name,
            o.email,
            o.phone,
            o.status,
            o.rejection_reason,
            o.created_at,
            o.bank_account_number,
            o.bank_ifsc_code,
            o.bank_name,
            o.upi_id,
            w.total_balance,
            w.withdrawn_amount,
            w.pending_withdrawals,
            w.available_balance
         FROM organisers o
         LEFT JOIN wallets w ON o.organiser_id = w.owner_id AND w.owner_type = 'organizer'
         WHERE o.organiser_id = $1`,
    [organiser_id]
  );
  return result.rows[0];
};

export const ApprovedOrganiser = async () => {
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
         WHERE status='approved'
         ORDER BY created_at ASC`,
  );
  return result.rows;
};

export const approveOrganiser = async (organiser_id) => {
  const result = await pool.query(
    `UPDATE organisers
         SET
         status='approved',
         updated_at=CURRENT_TIMESTAMP
         WHERE organiser_id=$1
         RETURNING organiser_id, full_name, organisation_name, email, status`,
    [organiser_id],
  );
  return result.rows[0];
};

export const RejectedOrganiser = async () => {
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
         WHERE status='rejected'
         ORDER BY created_at ASC`,
  );
  return result.rows;
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
    [reason, organiser_id],
  );
  return result.rows[0];
};

export const deleteOrganiser = async (organiser_id) => {
  const result = await pool.query(
    `DELETE FROM organisers
         WHERE organiser_id=$1
         RETURNING organiser_id`,
    [organiser_id],
  );
  return result.rows[0];
};

export const updateOrganiserProfile = async (
  organiser_id,
  full_name,
  phone,
) => {
  const result = await pool.query(
    `UPDATE organisers
     SET full_name=$1, phone=$2, updated_at=CURRENT_TIMESTAMP
     WHERE organiser_id=$3
     RETURNING organiser_id, full_name, organisation_name, email, phone`,
    [full_name, phone, organiser_id],
  );
  return result.rows[0];
};

export const updateOrganiserBankDetails = async (
  organiser_id,
  bank_account_number,
  bank_ifsc_code,
  upi_id,
  bank_name,
) => {
  const result = await pool.query(
    `UPDATE organisers
     SET bank_account_number=$1, bank_ifsc_code=$2, upi_id=$3, bank_name=$4, updated_at=CURRENT_TIMESTAMP
     WHERE organiser_id=$5
     RETURNING organiser_id, bank_account_number, bank_ifsc_code, upi_id, bank_name`,
    [bank_account_number, bank_ifsc_code, upi_id, bank_name, organiser_id],
  );
  return result.rows[0];
};

// Joined query to supply stats for admin dashboards
export const getAllOrganisersWithStats = async () => {
  const result = await pool.query(
    `SELECT 
        o.organiser_id,
        o.full_name,
        o.organisation_name,
        o.email,
        o.phone,
        o.status,
        o.created_at,
        COUNT(DISTINCT e.event_id)::INT AS events_count
     FROM organisers o
     LEFT JOIN events e ON o.organiser_id = e.organiser_id
     GROUP BY o.organiser_id
     ORDER BY o.created_at DESC`,
  );
  return result.rows;
};

export const getWalletByOwnerId = async (ownerId) => {
    const result = await pool.query(
        `SELECT 
            wallet_id,
            owner_type,
            owner_id,
            total_balance,
            withdrawn_amount,
            (total_balance - withdrawn_amount) AS available_balance,
            currency,
            created_at,
            updated_at
         FROM wallets 
         WHERE owner_id = $1`,
        [ownerId]
    );
    return result.rows[0];
};

export const createWallet = async (ownerType, ownerId, currency = 'INR') => {
    const result = await pool.query(
        `INSERT INTO wallets (owner_type, owner_id, total_balance, withdrawn_amount, currency)
        VALUES ($1, $2, 0.00, 0.00, $3)
        RETURNING 
            wallet_id,
            owner_type,
            owner_id,
            total_balance,
            withdrawn_amount,
            (total_balance - withdrawn_amount) AS available_balance,
            currency,
            created_at,
            updated_at`,
        [ownerType, ownerId, currency]
    );
    return result.rows[0];
};