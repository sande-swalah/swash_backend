const pool = require('../../../db');
const User = require('./user_domain');

async function createUser({ email, passwordHash, role }) {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role
  `;

  const result = await pool.query(query, [email, passwordHash, role]);
  return result.rows[0];
}

async function findByEmail(email) {
  const query = `
    SELECT id, email, password_hash, role
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0] ? User.fromDb(result.rows[0]) : null;
}

async function findById(id) {
  const query = `
    SELECT id, email, role
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] ? User.fromDb(result.rows[0]) : null;
}

async function getAllUsers() {
  const query = `
    SELECT id, email, role
    FROM users
    ORDER BY id ASC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function updateUserRole(id, role) {
  const query = `
    UPDATE users
    SET role = $1
    WHERE id = $2
    RETURNING id, email, role
  `;

  const result = await pool.query(query, [role, id]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  getAllUsers,
  updateUserRole,
};
