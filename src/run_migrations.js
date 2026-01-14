const fs = require('fs');
const path = require('path');
const db = require('./db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, '..', 'db', 'migrations', 'create_games_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration:', sqlPath);
    await db.query(sql);
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  }
}

run();
