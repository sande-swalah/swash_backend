const crypto = require('node:crypto');
const pool = require('../../../db');

async function createInvitation({ email, role, propertyId, unitId, invitedBy, expiresInDays }) {
  const code = crypto.randomBytes(24).toString('base64url');
  const result = await pool.query(
    `INSERT INTO invitations (email, role, property_id, unit_id, invited_by, code, expires_at)
     SELECT $1, $2::user_role, $3::integer, $4::integer, $5::integer, $6,
            current_timestamp + ($7::integer * interval '1 day')
     WHERE ($2::user_role = 'employee'::user_role AND EXISTS (
              SELECT 1 FROM properties WHERE id = $3::integer AND owner_id = $5::integer
            ))
        OR ($2::user_role = 'tenant'::user_role AND EXISTS (
          SELECT 1 FROM units u JOIN properties p ON p.id = u.property_id
          WHERE u.id = $4::integer AND p.owner_id = $5::integer
        ))
     RETURNING id, email, role, property_id AS "propertyId", unit_id AS "unitId", code,
               expires_at AS "expiresAt", status`,
    [email.toLowerCase(), role, propertyId || null, unitId || null, invitedBy, code, expiresInDays]
  );
  return result.rows[0] || null;
}

async function getValidInvitation(code, email) {
  const result = await pool.query(
    `SELECT id, email, role, property_id AS "propertyId", unit_id AS "unitId",
            invited_by AS "invitedBy", code
     FROM invitations
     WHERE code = $1 AND lower(email) = lower($2) AND status = 'pending' AND expires_at > current_timestamp`,
    [code, email]
  );
  return result.rows[0] || null;
}

async function acceptInvitation(id, userId, invitation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE invitations SET status = 'accepted', accepted_at = current_timestamp
       WHERE id = $1 AND status = 'pending' RETURNING id`,
      [id]
    );
    if (!result.rows[0]) throw new Error('Invitation is no longer available');
    if (invitation.role === 'tenant') {
      await client.query(
        `INSERT INTO tenant_profiles (user_id, unit_id) VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET unit_id = EXCLUDED.unit_id`,
        [userId, invitation.unitId]
      );
      await client.query('UPDATE units SET is_occupied = true WHERE id = $1', [invitation.unitId]);
    } else {
      await client.query(
        `INSERT INTO employee_properties (employee_id, property_id) VALUES ($1, $2)
         ON CONFLICT (employee_id, property_id) DO NOTHING`,
        [userId, invitation.propertyId]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createInvitation, getValidInvitation, acceptInvitation };