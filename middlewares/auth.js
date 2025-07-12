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
