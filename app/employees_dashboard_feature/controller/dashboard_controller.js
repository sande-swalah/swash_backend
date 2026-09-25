const pool = require('../../../db');

async function summary(req, res) {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS "openRepairs"
       FROM repairs WHERE status IN ('open', 'assigned', 'in_progress')`,
    );
    return res.json({ dashboard: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load employee dashboard' });
  }
}

module.exports = { summary };