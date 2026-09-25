const pool = require('../../../db');

async function summary(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM properties WHERE owner_id = $1) AS properties,
         (SELECT COUNT(*)::int FROM units u JOIN properties p ON p.id = u.property_id WHERE p.owner_id = $1) AS units,
         (SELECT COUNT(*)::int FROM bills b JOIN units u ON u.id = b.unit_id JOIN properties p ON p.id = u.property_id WHERE p.owner_id = $1 AND b.status <> 'paid') AS outstandingBills,
         (SELECT COALESCE(SUM(pay.amount), 0) FROM payments pay JOIN bills b ON b.id = pay.bill_id JOIN units u ON u.id = b.unit_id JOIN properties p ON p.id = u.property_id WHERE p.owner_id = $1 AND pay.status = 'confirmed') AS totalCollected,
         (SELECT COUNT(*)::int FROM repairs r JOIN units u ON u.id = r.unit_id JOIN properties p ON p.id = u.property_id WHERE p.owner_id = $1 AND r.status NOT IN ('resolved', 'cancelled')) AS openRepairs`,
      [req.user.sub]
    );
    return res.json({ dashboard: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load owner dashboard' });
  }
}

module.exports = { summary };