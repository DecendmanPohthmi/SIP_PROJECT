import pool from "../config/db.js";

export const PayoutModel = {
  // Fetch wallet and select the automatically generated available_balance column
  async getWalletByOwnerId(ownerId) {
    const query = `
      SELECT 
          wallet_id,
          owner_type,
          owner_id,
          total_balance,
          withdrawn_amount,
          pending_withdrawals,
          available_balance,
          currency,
          created_at,
          updated_at
       FROM wallets
       WHERE owner_id = $1
    `;
    const result = await pool.query(query, [ownerId]);
    return result.rows[0];
  },

  // Insert a new payout request, increment pending_withdrawals, and deduct safely inside a transaction
  async createPayout(payoutData) {
    const {
      organiser_id,
      amount,
      payout_type,
      account_holder,
      bank_name,
      account_number,
      bank_ifsc_code,
      upi_id,
      razorpay_contact_id,
      razorpay_fund_account_id,
      razorpay_payout_id,
    } = payoutData;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Lock and check the wallet using the generated available_balance
      const walletCheckQuery = `
        SELECT available_balance 
        FROM wallets 
        WHERE owner_id = $1 
        FOR UPDATE
      `;
      const walletRes = await client.query(walletCheckQuery, [organiser_id]);

      if (walletRes.rows.length === 0) {
        throw new Error("Wallet not found for this organiser.");
      }

      const wallet = walletRes.rows[0];
      const availableBalance = parseFloat(wallet.available_balance || 0);

      if (parseFloat(amount) > availableBalance) {
        throw new Error("Requested amount exceeds available balance.");
      }

      // 2. Increment pending_withdrawals (PostgreSQL will auto-recalculate available_balance via generated column)
      const updateWalletQuery = `
        UPDATE wallets 
        SET pending_withdrawals = pending_withdrawals + $1, updated_at = NOW()
        WHERE owner_id = $2
      `;
      await client.query(updateWalletQuery, [amount, organiser_id]);

      // 3. Insert the payout record with 'pending' status
      const insertPayoutQuery = `
        INSERT INTO organiser_payouts (
          organiser_id, amount, payout_type, 
          account_holder, bank_name, account_number, bank_ifsc_code, 
          upi_id, razorpay_contact_id, razorpay_fund_account_id, razorpay_payout_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING *
      `;
      const values = [
        organiser_id,
        amount,
        payout_type,
        account_holder || null,
        bank_name || null,
        account_number || null,
        bank_ifsc_code || null,
        upi_id || null,
        razorpay_contact_id || null,
        razorpay_fund_account_id || null,
        razorpay_payout_id || null,
      ];

      const payoutResult = await client.query(insertPayoutQuery, values);

      await client.query("COMMIT");
      return payoutResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async incrementPendingWithdrawals(ownerId, amount) {
    const query = `
      UPDATE wallets 
      SET pending_withdrawals = pending_withdrawals + $1, updated_at = NOW()
      WHERE owner_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [amount, ownerId]);
    return result.rows[0];
  },

  // Fetch all payout history for an organiser
  async getAllPayoutsByOrganiserId(organiserId) {
    const query = `
      SELECT * FROM organiser_payouts 
      WHERE organiser_id = $1 
      ORDER BY requested_at DESC
    `;
    const result = await pool.query(query, [organiserId]);
    return result.rows;
  }
};