import { PayoutModel } from "../models/payoutModel.js";

// Request Withdrawal
export const requestWithdrawal = async (req, res) => {
  const organiserId = req.user.id; // Extracted from auth middleware
  const { amount, payout_type, bank_name, account_number, bank_ifsc_code, account_holder, upi_id } = req.body;

  // 1. Validation checks
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 300) {
    return res.status(400).json({ success: false, message: "Minimum withdrawal amount is ₹300." });
  }

  if (numericAmount > 100000) {
    return res.status(400).json({ success: false, message: "Maximum withdrawal amount is ₹1,00,000 per request." });
  }

  if (!payout_type || !["bank", "upi"].includes(payout_type)) {
    return res.status(400).json({ success: false, message: "Invalid payout type specified." });
  }

  if (payout_type === "bank" && (!bank_name || !account_number || !bank_ifsc_code || !account_holder)) {
    return res.status(400).json({ success: false, message: "All bank account details are required." });
  }

  if (payout_type === "upi" && !upi_id) {
    return res.status(400).json({ success: false, message: "UPI ID is required." });
  }

  try {
    // 2. Check available wallet balance directly using the generated database column
    const wallet = await PayoutModel.getWalletByOwnerId(organiserId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found for this organiser." });
    }

    const availableBalance = parseFloat(wallet.available_balance);

    if (numericAmount > availableBalance) {
      return res.status(400).json({ success: false, message: "Withdrawal amount cannot exceed your available balance." });
    }

    // 3. Create payout record and update pending withdrawals in one atomic transaction
    const newPayout = await PayoutModel.createPayout({
      organiser_id: organiserId,
      amount: numericAmount,
      payout_type,
      account_holder,
      bank_name,
      account_number,
      bank_ifsc_code,
      upi_id,
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      payout: newPayout,
    });
  } catch (err) {
    console.error("Error processing withdrawal request:", err);
    return res.status(500).json({ success: false, message: err.message || "Server error while processing withdrawal." });
  }
};

// Fetch All Withdrawal History
export const fetchAllWithdrawHistory = async (req, res) => {
  const organiserId = req.user.id;

  try {
    const payouts = await PayoutModel.getAllPayoutsByOrganiserId(organiserId);
    return res.status(200).json({
      success: true,
      payouts,
    });
  } catch (err) {
    console.error("Error fetching payout history:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching payout history." });
  }
};