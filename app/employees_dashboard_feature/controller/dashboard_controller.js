const pool = require('../../../db');

async function summary(req, res) {
  try {
    const result = await pool.query(
        `SELECT
         (SELECT COUNT(*)::int FROM repairs
          WHERE assigned_employee_id = $1 AND status IN ('open', 'assigned', 'pending', 'in_progress')) AS "openRepairs",
         (SELECT COUNT(*)::int FROM bills b JOIN units u ON u.id = b.unit_id
          JOIN employee_properties ep ON ep.property_id = u.property_id
          WHERE ep.employee_id = $1 AND b.type IN ('water', 'electricity', 'wifi') AND b.status <> 'paid') AS "outstandingUtilityBills"`,
        [req.user.sub]
    );
    return res.json({ dashboard: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load employee dashboard' });
  }
}

module.exports = { summary };