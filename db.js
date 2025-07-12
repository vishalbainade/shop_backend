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
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

// Force IPv4 resolution
const customLookup = (hostname, options, callback) => {
  return dns.lookup(hostname, { family: 4 }, callback);
};

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  lookup: customLookup // ✅ Force IPv4 lookup
});

pool.connect()
  .then(() => console.log("✅ Connected to Supabase PostgreSQL via IPv4"))
  .catch(err => console.error("❌ Supabase connection error:", err));

module.exports = pool;
