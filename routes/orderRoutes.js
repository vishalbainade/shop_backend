// const express = require('express');
// const router = express.Router();

// const { getMyOrders, getAllOrders } = require('../controllers/orderController');
// const authenticateUser = require('../middlewares/authmiddleware');
// const verifyAdmin = require('../middlewares/adminAuth');

// // User route - Get only their orders
// router.get('/myorders', authenticateUser, getMyOrders);

// // Admin route - Get all orders
// router.get('/admin/orders', verifyAdmin, getAllOrders);

// module.exports = router;


const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get all orders for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get orders error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a new order
router.post('/', verifyToken, async (req, res) => {
  const {
    product_id,
    product_name,
    product_image,
    price,
    quantity,
    total_cost,
    payment_method,
    address,
    razorpay_order_id,
    razorpay_payment_id
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO orders (
        user_id, product_id, product_name, product_image, price, quantity,
        total_cost, payment_method, address, razorpay_order_id, razorpay_payment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.id,
        product_id,
        product_name,
        product_image,
        price,
        quantity,
        total_cost,
        payment_method,
        address,
        razorpay_order_id,
        razorpay_payment_id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create order error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
