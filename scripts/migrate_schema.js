
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    // 1. Add 'mailed' column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='mailed') THEN
          ALTER TABLE appointments ADD COLUMN mailed BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added mailed column to appointments table';
        END IF;
      END
      $$;
    `);

    // 2. Add 'system_config' table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
      );
    `);
    
    // 3. Initialize last_mailed_at if needed
    await pool.query(`
      INSERT INTO system_config (key, value)
      VALUES ('last_mailed_at', '1970-01-01T00:00:00.000Z')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('Schema migration completed successfully.');
    
    // Now retry the backdate logic
    // Backdate all unmailed appointments to 15 minutes ago
    const result = await pool.query(
      "UPDATE appointments SET created_at = NOW() - INTERVAL '15 minutes' WHERE mailed = FALSE"
    );
    console.log(`Backdated ${result.rowCount} appointments.`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
