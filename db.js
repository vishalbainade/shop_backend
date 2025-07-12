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
  host: process.env.DB_HOST,             // <-- Ensure using hostname, not IP
  port: process.env.DB_PORT,             // <-- Ensure using correct port (5432)
  user: process.env.DB_USER,             // <-- Ensure using username
  password: process.env.DB_PASSWORD,     // <-- Ensure using password
  database: process.env.DB_NAME,         // <-- Ensure using database name
  ssl: {
    rejectUnauthorized: false,           // Necessary for Supabase SSL connection
    require: true,                       // Enforce SSL connection
  },
});

pool.connect()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL!"))
  .catch(err => console.error("❌ Supabase connection error:", err.stack));

module.exports = pool;

