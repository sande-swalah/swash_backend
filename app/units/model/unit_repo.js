const pool = require('../../../db');

async function createUnit({ propertyId, unitNumber, rentAmount, ownerId }) {
  const result = await pool.query(
    `INSERT INTO units (property_id, unit_number, rent_amount)
     SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM properties WHERE id = $1 AND owner_id = $4)
     RETURNING id, property_id AS "propertyId", unit_number AS "unitNumber", rent_amount AS "rentAmount"`,
    [propertyId, unitNumber, rentAmount, ownerId]
  );
  return result.rows[0] || null;
}

async function listUnits(propertyId, ownerId) {
  const result = await pool.query(
    `SELECT u.id, u.property_id AS "propertyId", u.unit_number AS "unitNumber",
            u.rent_amount AS "rentAmount", tp.user_id AS "tenantUserId"
     FROM units u JOIN properties p ON p.id = u.property_id
     LEFT JOIN tenant_profiles tp ON tp.unit_id = u.id
     WHERE u.property_id = $1 AND p.owner_id = $2 ORDER BY u.unit_number`,
    [propertyId, ownerId]
  );
  return result.rows;
}

async function getTenantUnit(userId) {
  const result = await pool.query(
    `SELECT u.id, u.property_id AS "propertyId", u.unit_number AS "unitNumber",
            u.rent_amount AS "rentAmount", p.name AS "propertyName", p.address
     FROM tenant_profiles tp JOIN units u ON u.id = tp.unit_id
     JOIN properties p ON p.id = u.property_id WHERE tp.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = { createUnit, listUnits, getTenantUnit };