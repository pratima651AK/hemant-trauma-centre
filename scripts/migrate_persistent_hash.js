
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Starting Persistent Hash Migration...');

    // 1. Create Sync History Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id SERIAL PRIMARY KEY,
        fingerprint VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created sync_history table.');

    // 2. Ensure system_config exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
      );
    `);

    // 3. Create the Trigger Function
    // This functionality gets the aggregated string of "id:version" for all active rows,
    // hashes it, and stores it in system_config + sync_history.
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_global_hash() RETURNS TRIGGER AS $$
      DECLARE
        new_hash TEXT;
      BEGIN
        -- Calculate Hash: MD5 of all ID:Version pairs ordered by ID
        -- Requires pgcrypto or basic md5 support. Native 'md5' works on text.
        SELECT md5(COALESCE(string_agg(id || ':' || version, '|' ORDER BY id), ''))
        INTO new_hash
        FROM appointments
        WHERE is_deleted = FALSE;

        -- Update Config (Single Source of Truth)
        INSERT INTO system_config (key, value)
        VALUES ('global_hash', new_hash)
        ON CONFLICT (key) DO UPDATE SET value = new_hash;

        -- Add to History (Audit Log)
        INSERT INTO sync_history (fingerprint) VALUES (new_hash);

        -- Keep only last 10 entries in history
        DELETE FROM sync_history 
        WHERE id NOT IN (
          SELECT id FROM sync_history ORDER BY id DESC LIMIT 10
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Created update_global_hash function.');

    // 4. Create the Trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_global_hash ON appointments;
      
      CREATE TRIGGER trigger_update_global_hash
      AFTER INSERT OR UPDATE OR DELETE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_global_hash();
    `);
    console.log('Created database trigger.');

    // 5. Initial Calculation
    // We need to run it once now to set the initial hash
    await pool.query(`
      DO $$
      DECLARE
        new_hash TEXT;
      BEGIN
        SELECT md5(COALESCE(string_agg(id || ':' || version, '|' ORDER BY id), ''))
        INTO new_hash FROM appointments WHERE is_deleted = FALSE;

        INSERT INTO system_config (key, value)
        VALUES ('global_hash', new_hash)
        ON CONFLICT (key) DO UPDATE SET value = new_hash;
        
        INSERT INTO sync_history (fingerprint) VALUES (new_hash);
      END $$;
    `);
    console.log('Seed initial hash calculated.');

    console.log('Migration Complete.');
  } catch (err) {
    console.error('Migration Failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
