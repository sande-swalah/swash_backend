const pool = require('../../../db');

async function listAlerts(userId) {
  const result = await pool.query(
    `SELECT id, type, title, message, read_at AS "readAt", created_at AS "createdAt"
     FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId]
  );
  return result.rows;
}

async function markRead(id, userId) {
  const result = await pool.query(
    `UPDATE alerts SET read_at = COALESCE(read_at, current_timestamp)
     WHERE id = $1 AND user_id = $2 RETURNING id, read_at AS "readAt"`,
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = { listAlerts, markRead };