const pool = require('../../../db');

async function createProperty({ name, address, ownerId }) {
  const result = await pool.query(
    `INSERT INTO properties (name, address, owner_id) VALUES ($1, $2, $3)
     RETURNING id, name, address, owner_id AS "ownerId"`,
    [name, address, ownerId]
  );
  return result.rows[0];
}

async function listProperties(ownerId) {
  const result = await pool.query(
    `SELECT p.id, p.name, p.address, p.owner_id AS "ownerId", COUNT(u.id)::int AS "unitCount"
     FROM properties p LEFT JOIN units u ON u.property_id = p.id
     WHERE p.owner_id = $1 GROUP BY p.id ORDER BY p.id DESC`,
    [ownerId]
  );
  return result.rows;
}

async function getProperty(id, ownerId) {
  const result = await pool.query(
    `SELECT id, name, address, owner_id AS "ownerId" FROM properties
     WHERE id = $1 AND owner_id = $2`,
    [id, ownerId]
  );
  return result.rows[0] || null;
}

async function assignTenant({ userId, unitId, ownerId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO tenant_profiles (user_id, unit_id)
       SELECT $1, $2
       WHERE EXISTS (SELECT 1 FROM users WHERE id = $1 AND role = 'tenant')
         AND EXISTS (SELECT 1 FROM units u JOIN properties p ON p.id = u.property_id
                     WHERE u.id = $2 AND p.owner_id = $3)
       ON CONFLICT (user_id) DO UPDATE SET unit_id = EXCLUDED.unit_id
       RETURNING id, user_id AS "userId", unit_id AS "unitId"`,
      [userId, unitId, ownerId]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('UPDATE units SET is_occupied = true WHERE id = $1', [unitId]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  }

module.exports = { createProperty, listProperties, getProperty, assignTenant };