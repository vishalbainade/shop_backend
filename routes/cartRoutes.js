// const express = require("express");
// const router = express.Router();
// const authenticateUser = require("../middlewares/authmiddleware.js");

// const {
//   addToCart,
//   getUserCart,
//   removeFromCart,
// } = require("../controllers/cartController");

// // Routes for authenticated users only
// router.post("/cartadd", authenticateUser, addToCart);
// router.get("/cartget", authenticateUser, getUserCart);
// router.delete("/cartdel/:itemId", authenticateUser, removeFromCart);

// module.exports = router;


const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get cart items
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get cart error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    // Check if item exists in cart
    const existingItem = await pool.query(
      'SELECT * FROM find_cart_item($1, $2)',
      [req.user.id, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      await pool.query(
        'SELECT update_cart_item_quantity($1, $2, $3)',
        [quantity, req.user.id, product_id]
      );
    } else {
      // Insert new cart item
      await pool.query(
        'SELECT insert_cart_item($1, $2, $3)',
        [req.user.id, product_id, quantity]
      );
    }

    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Add to cart error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update cart item quantity
router.put('/update/:item_id', verifyToken, async (req, res) => {
  const { item_id } = req.params;
  const { quantity } = req.body;
  try {
    await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
      [quantity, item_id, req.user.id]
    );
    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Update cart error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete cart item
router.delete('/delete/:item_id', verifyToken, async (req, res) => {
  const { item_id } = req.params;
  try {
    await pool.query('SELECT delete_cart_item($1)', [item_id]);
    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Delete cart error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Remove multiple cart items
router.post('/remove', verifyToken, async (req, res) => {
  const { product_ids } = req.body;
  try {
    await pool.query('SELECT remove_items_from_cart($1, $2)', [req.user.id, product_ids]);
    const result = await pool.query('SELECT * FROM get_user_cart_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Remove cart items error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
