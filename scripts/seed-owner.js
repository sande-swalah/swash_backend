require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL || 'owner@swash.com';
  const password = process.env.SEED_OWNER_PASSWORD || 'OwnerPassword123!';

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log(`Owner already exists: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, 'owner']
    );

    console.log('Owner created successfully');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (error) {
    console.error('Failed to create owner user');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
}

seedOwner();
