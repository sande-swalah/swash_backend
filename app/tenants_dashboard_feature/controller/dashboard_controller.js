const pool = require('../../../db');

async function summary(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM bills b JOIN units u ON u.id = b.unit_id JOIN tenant_profiles tp ON tp.unit_id = u.id WHERE tp.user_id = $1 AND b.status <> 'paid') AS outstandingBills,
         (SELECT COALESCE(SUM(b.amount), 0) FROM bills b JOIN units u ON u.id = b.unit_id JOIN tenant_profiles tp ON tp.unit_id = u.id WHERE tp.user_id = $1 AND b.type = 'rent' AND b.status <> 'paid') AS "rentDue",
         (SELECT COALESCE(SUM(b.amount), 0) FROM bills b JOIN units u ON u.id = b.unit_id JOIN tenant_profiles tp ON tp.unit_id = u.id WHERE tp.user_id = $1 AND b.type IN ('water', 'electricity', 'wifi') AND b.status <> 'paid') AS "utilitiesDue",
         (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_user_id = $1 AND status = 'confirmed') AS totalPaid,
         (SELECT COUNT(*)::int FROM repairs r JOIN tenant_profiles tp ON tp.unit_id = r.unit_id WHERE tp.user_id = $1 AND r.status NOT IN ('resolved', 'cancelled')) AS openRepairs`,
      [req.user.sub]
    );
    return res.json({ dashboard: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load tenant dashboard' });
  }
}

module.exports = { summary };