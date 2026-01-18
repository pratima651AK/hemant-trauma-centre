
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetAndBackdate() {
  try {
    // 1. Force all appointments to be unmailed and old enough
    const result = await pool.query(
      "UPDATE appointments SET mailed = FALSE, created_at = NOW() - INTERVAL '30 minutes'"
    );
    console.log(`Reset ${result.rowCount} appointments to unmailed status.`);
    
    // 2. Reset throttle
    await pool.query(
      "UPDATE system_config SET value = $1 WHERE key = 'last_mailed_at'",
      [new Date(0).toISOString()]
    );
    console.log("Reset system throttle.");
    
  } catch (err) {
    console.error('Reset failed:', err);
  } finally {
    await pool.end();
  }
}

resetAndBackdate();
