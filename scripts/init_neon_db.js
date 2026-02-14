
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    console.log('Initializing Neon Database...');

    // 1. Create appointments table
    console.log('Creating appointments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contacted BOOLEAN DEFAULT FALSE,
        visited BOOLEAN DEFAULT FALSE,
        mailed BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        version INTEGER DEFAULT 1,
        is_deleted BOOLEAN DEFAULT FALSE
      );
    `);

    // 2. Create sync_history table
    console.log('Creating sync_history table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_history (
        id SERIAL PRIMARY KEY,
        fingerprint VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create system_config table
    console.log('Creating system_config table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
      );
    `);

    // 4. Create Triggers for Sync
    console.log('Setting up Sync Triggers...');
    
    // Function to update global hash
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_global_hash() RETURNS TRIGGER AS $$
      DECLARE
        new_hash TEXT;
      BEGIN
        -- Calculate Hash: MD5 of all ID:Version pairs ordered by ID
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

    // Trigger on appointments
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_global_hash ON appointments;
      
      CREATE TRIGGER trigger_update_global_hash
      AFTER INSERT OR UPDATE OR DELETE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_global_hash();
    `);

    // Function to increment version on update
    await pool.query(`
      CREATE OR REPLACE FUNCTION increment_version() RETURNS TRIGGER AS $$
      BEGIN
        NEW.version = OLD.version + 1;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Trigger for version increment
    await pool.query(`
        DROP TRIGGER IF EXISTS set_version ON appointments;

        CREATE TRIGGER set_version
        BEFORE UPDATE ON appointments
        FOR EACH ROW
        EXECUTE FUNCTION increment_version();
    `);


    console.log('Database initialization completed successfully.');

  } catch (err) {
    console.error('Initialization failed:', err);
  } finally {
    await pool.end();
  }
}

initDB();
