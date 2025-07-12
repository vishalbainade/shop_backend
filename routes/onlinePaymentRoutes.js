// const express = require("express");
// const router = express.Router();
// const {
//   createRazorpayOrder,
//   placeOnlineOrder,
//   getRazorpayKey, // ✅ Correctly imported
// } = require("../controllers/onlinePaymentController");
// const authenticateUser = require("../middlewares/authmiddleware");

// // Create Razorpay order
// router.post("/create-order", authenticateUser, createRazorpayOrder);

// // Place final order after payment
// router.post("/verify-payment", authenticateUser, placeOnlineOrder);

// // Get Razorpay key (public route)
// router.get("/razorpay-key", getRazorpayKey);

// module.exports = router;
const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Save online payment details
router.post('/', verifyToken, async (req, res) => {
  const { order_id, payment_id, amount, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders
       SET razorpay_order_id = $1, razorpay_payment_id = $2, status = $3
       WHERE user_id = $4 AND total_cost = $5
       RETURNING *`,
      [order_id, payment_id, status || 'completed', req.user.id, amount / 100]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Online payment error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
