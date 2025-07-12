// const { Pool } = require('pg');
//      require('dotenv').config();

//      // Create PostgreSQL connection pool
//      const pool = new Pool({
//          connectionString: process.env.DATABASE_URL,
//          ssl: { rejectUnauthorized: false }, // Required for Supabase
//      });

//      // Check connection
//      pool.connect()
//          .then(() => console.log("✅ Connected to Supabase PostgreSQL!"))
//          .catch(err => console.error("❌ Supabase connection error:", err.stack));

//      module.exports = pool;

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
    require: true // Ensure SSL is enforced
  }
});

pool.connect()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL!"))
  .catch(err => console.error("❌ Supabase connection error:", err.stack));

module.exports = pool;
