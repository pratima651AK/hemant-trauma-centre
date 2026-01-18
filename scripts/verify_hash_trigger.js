
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyPersistentHash() {
  try {
    console.log('--- Verifying Persistent Hash System ---');

    // 1. Read Current Config Hash
    const res1 = await pool.query("SELECT value FROM system_config WHERE key = 'global_hash'");
    const configHash = res1.rows[0]?.value;
    console.log('1. Current Config Hash:', configHash);

    // 2. Calculate Manual Hash (Truth)
    const res2 = await pool.query("SELECT id, version FROM appointments WHERE is_deleted = FALSE ORDER BY id ASC");
    const hashString = res2.rows.map(r => `${r.id}:${r.version}`).join('|');
    const manualHash = crypto.createHash('md5').update(hashString).digest('hex');
    console.log('2. Manually Calculated Hash:', manualHash);

    if (configHash === manualHash) {
      console.log('✅ MATCH: system_config is in sync with actual data.');
    } else {
      console.error('❌ MISMATCH: Trigger might not be firing or logic differs.');
    }

    // 3. Test Trigger (Modify Data)
    console.log('\n--- Testing Trigger Update ---');
    console.log('Inserting dummy appointment...');
    const insertRes = await pool.query(`
      INSERT INTO appointments (name, mobile, message, created_at, version) 
      VALUES ('Test Hash', '0000000000', 'Hash Test', NOW(), 1) 
      RETURNING id
    `);
    const newId = insertRes.rows[0].id;

    // Read Config Hash Again
    const res3 = await pool.query("SELECT value FROM system_config WHERE key = 'global_hash'");
    const newConfigHash = res3.rows[0]?.value;
    console.log('3. New Config Hash:', newConfigHash);

    if (newConfigHash !== configHash) {
      console.log('✅ SUCCESS: Hash updated automatically.');
    } else {
      console.error('❌ FAILURE: Hash did not change after insert.');
    }

    // Cleanup
    await pool.query('DELETE FROM appointments WHERE id = $1', [newId]);
    console.log('Cleanup complete.');

  } catch (err) {
    console.error('Verification Failed:', err);
  } finally {
    await pool.end();
  }
}

verifyPersistentHash();
