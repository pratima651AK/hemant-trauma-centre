
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const dummyPatients = [
    { name: "Rahul Sharma", mobile: "9876543210", email: "rahul@example.com", message: "Severe knee pain while running." },
    { name: "Priya Singh", mobile: "9123456780", email: "priya@example.com", message: "Fracture consultation needed." },
    { name: "Amit Patel", mobile: "9988776655", email: "amit.p@example.com", message: "Follow up on shoulder surgery." },
    { name: "Sneha Gupta", mobile: "8877665544", email: "sneha@example.com", message: "Need physiotherapy for back pain." },
    { name: "Vikram Malhotra", mobile: "7766554433", email: "vikram@example.com", message: "Accident injury emergency inquiry." }
  ];

  try {
    for (const p of dummyPatients) {
      // Use raw SQL to insert to avoid depending on app code
      await pool.query(
        "INSERT INTO appointments (name, mobile, email, message) VALUES ($1, $2, $3, $4)",
        [p.name, p.mobile, p.email, p.message]
      );
      console.log(`Added patient: ${p.name}`);
    }
    console.log('Successfully seeded 5 dummy patients.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
