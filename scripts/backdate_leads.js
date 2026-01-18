
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function backdate() {
  try {
    // Backdate all unmailed appointments to 15 minutes ago so they qualify for the 5-minute buffer check
    const result = await pool.query(
      "UPDATE appointments SET created_at = NOW() - INTERVAL '15 minutes' WHERE mailed = FALSE"
    );
    console.log(`Backdated ${result.rowCount} appointments to ensure they trigger the email.`);
    
    // Also reset the 'last_mailed_at' config to ensure the throttle doesn't block us
    await pool.query(
      "UPDATE system_config SET value = $1 WHERE key = 'last_mailed_at'",
      [new Date(0).toISOString()] // Set to epoch so it's definitely > 5 mins ago
    );
    console.log("Reset last_mailed_at throttle.");
    
  } catch (err) {
    console.error('Backdating failed:', err);
  } finally {
    await pool.end();
  }
}

backdate();
