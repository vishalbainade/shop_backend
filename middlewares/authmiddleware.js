// const jwt = require("jsonwebtoken");

// const authenticateUser = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Access denied. No token provided." });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { userId: decoded.userId };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token." });
//   }
// };

// module.exports = authenticateUser;

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const pool = require('../db');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify Supabase Auth token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get integer user_id from users table
    const userResult = await pool.query('SELECT id FROM users WHERE uuid = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    req.user = {
      id: userResult.rows[0].id, // Integer user_id
      uuid: user.id, // Supabase UUID
      email: user.email
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { verifyToken };
