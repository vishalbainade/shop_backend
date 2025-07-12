// const express = require("express");
// const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
// const authenticateUser = require("../middlewares/authmiddleware"); 

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.get("/logout", authenticateUser, logoutUser);

// module.exports = router;

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const pool = require('../db');
require('dotenv').config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone_number, nationality, address } = req.body;
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Ensure user exists in users table (trigger should handle this)
    const userResult = await pool.query(
      'SELECT id FROM users WHERE uuid = $1',
      [data.user.id]
    );
    if (userResult.rows.length === 0) {
      // Insert additional user data if needed
      await pool.query(
        'INSERT INTO users (uuid, name, email, password, phone_number, nationality, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [data.user.id, name, email, password, phone_number, nationality, address]
      );
      const newUserResult = await pool.query(
        'SELECT id FROM users WHERE uuid = $1',
        [data.user.id]
      );
      return res.json({
        user: data.user,
        userId: newUserResult.rows[0].id,
        token: data.session?.access_token
      });
    }

    res.json({
      user: data.user,
      userId: userResult.rows[0].id,
      token: data.session?.access_token
    });
  } catch (err) {
    console.error('Signup error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const userResult = await pool.query(
      'SELECT id FROM users WHERE uuid = $1',
      [data.user.id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json({
      user: data.user,
      userId: userResult.rows[0].id,
      token: data.session.access_token
    });
  } catch (err) {
    console.error('Login error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Password Reset
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://buybuddyweb.netlify.app/reset-password'
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Password reset email sent', data });
  } catch (err) {
    console.error('Reset password error:', err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
