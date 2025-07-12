// const express = require("express");
// const router = express.Router();
// const authenticateUser = require("../middlewares/authmiddleware.js");

// const {
//   addToWishlist,
//   getUserWishlist,
//   removeFromWishlist,
// } = require("../controllers/wishlistController");

// // Routes
// router.post("/wishlistadd", authenticateUser, addToWishlist);
// router.get("/wishlistget", authenticateUser, getUserWishlist);
// router.delete("/wishlistdel/:itemId", authenticateUser, removeFromWishlist);

// module.exports = router;

const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get wishlist items
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_user_wishlist_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Get wishlist error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add to wishlist
router.post('/add', verifyToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const existingItem = await pool.query(
      'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingItem.rows.length === 0) {
      await pool.query(
        'INSERT INTO wishlist_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, product_id, quantity || 1]
      );
    }

    const result = await pool.query('SELECT * FROM get_user_wishlist_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Add to wishlist error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Remove from wishlist
router.delete('/delete/:item_id', verifyToken, async (req, res) => {
  const { item_id } = req.params;
  try {
    await pool.query(
      'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2',
      [item_id, req.user.id]
    );
    const result = await pool.query('SELECT * FROM get_user_wishlist_items($1)', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Remove from wishlist error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
