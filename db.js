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



// const { Pool } = require('pg');
// const dns = require('dns').promises;
// require('dotenv').config();

// async function createPoolWithIPv4() {
//   try {
//     // ✅ Resolve IPv4 address only
//     const result = await dns.lookup(process.env.DB_HOST, { family: 4 });
//     const ipv4Address = result.address;

//     console.log("Resolved IPv4:", ipv4Address);

//     const pool = new Pool({
//       host: ipv4Address, // ✅ use IP instead of hostname to skip DNS resolution
//       port: Number(process.env.DB_PORT),
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       ssl: {
//         rejectUnauthorized: false,
//         require: true
//       }
//     });

//     pool.connect()
//       .then(() => console.log("✅ Connected to Supabase via IPv4"))
//       .catch(err => console.error("❌ Supabase connection error (forced IPv4):", err.stack));

//     module.exports = pool;

//   } catch (error) {
//     console.error("❌ Failed to resolve IPv4 for Supabase DB host:", error);
//     process.exit(1);
//   }
// }

// createPoolWithIPv4();


////////////////////////////////////////////////////////////////////////////////////////////


// const { Pool } = require('pg');
// require('dotenv').config();

// console.log("Connecting to DB with:", {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     require: true,
//     rejectUnauthorized: false,
//   },
// });

// pool.connect()
//   .then(() => console.log("✅ Connected to Supabase via Transaction Pooler"))
//   .catch(err => console.error("❌ Supabase connection error:", err.stack));

// module.exports = pool;
///////////////////////////////////////////////////////////

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false } // Required on some hosts like Render
});

pool.connect()
  .then(client => {
    console.log('✅ DB Connected Successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ DB Connection Failed:', err.message);
  });


module.exports = pool;
