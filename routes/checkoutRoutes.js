// const express = require("express");
// const router = express.Router();
// const { initializeCheckout, getOrderSummary, checkoutSingleProduct } = require("../controllers/checkoutController");
// const authenticateUser = require("../middlewares/authmiddleware");

// router.get("/init", authenticateUser, initializeCheckout);             //get data from cart
// router.get("/order-summary", authenticateUser, getOrderSummary);      //order confirm page for payment or COD
// router.get("/product/:id", authenticateUser, checkoutSingleProduct); //get data directly from product page 



// module.exports = router;

const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Get cart items for checkout
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Get checkout cart error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create orders from cart (checkout)
router.post('/', verifyToken, async (req, res) => {
  const { address, payment_method } = req.body;
  try {
    const cartResult = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orders = [];
    for (const item of cartResult.rows) {
      const orderResult = await pool.query(
        `INSERT INTO orders (
          user_id, product_id, product_name, product_image, price, quantity,
          total_cost, payment_method, address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          req.user.id,
          item.product_id,
          item.product_name,
          item.product_image,
          item.product_price,
          item.quantity,
          item.product_price * item.quantity,
          payment_method,
          address
        ]
      );
      orders.push(orderResult.rows[0]);
    }

    await pool.query('SELECT remove_items_from_cart($1, $2)', [
      req.user.id,
      cartResult.rows.map(item => item.product_id)
    ]);

    res.json({ message: 'Checkout successful', orders });
  } catch (err) {
    console.error('Checkout error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
