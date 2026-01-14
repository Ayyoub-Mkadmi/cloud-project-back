const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASS || process.env.PGPASSWORD || '',
  database: process.env.DB_NAME || process.env.PGDATABASE || 'gamesdb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.PGPORT ? Number(process.env.PGPORT) : 5432),
};

const pool = new Pool(config);

// Test connection on startup and log informative messages
(async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log(`Postgres connected: ${config.user}@${config.host}:${config.port}/${config.database}`);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Postgres connection error:', err.message || err);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  config,
};
