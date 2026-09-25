const pool = require('../../../db');

async function createBill({ unitId, amount, type, dueDate, ownerId }) {
  const result = await pool.query(
    `INSERT INTO bills (unit_id, amount, type, status, due_date)
     SELECT $1, $2, $3, 'pending', $4
     WHERE EXISTS (SELECT 1 FROM units u JOIN properties p ON p.id = u.property_id
                   WHERE u.id = $1 AND (p.owner_id = $5 OR EXISTS (
                     SELECT 1 FROM employee_properties ep WHERE ep.property_id = p.id AND ep.employee_id = $5
                   )))
     RETURNING id, unit_id AS "unitId", amount, type, status, due_date AS "dueDate"`,
    [unitId, amount, type, dueDate, ownerId]
  );
  return result.rows[0] || null;
}

async function listBills(user) {
  const condition = user.role === 'tenant'
    ? 'tp.user_id = $1'
    : user.role === 'employee'
      ? 'EXISTS (SELECT 1 FROM employee_properties ep WHERE ep.property_id = p.id AND ep.employee_id = $1)'
      : 'p.owner_id = $1';
  const result = await pool.query(
    `SELECT b.id, b.unit_id AS "unitId", b.amount, b.type, b.status,
            b.due_date AS "dueDate", COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'confirmed'), 0) AS "paidAmount"
     FROM bills b JOIN units u ON u.id = b.unit_id JOIN properties p ON p.id = u.property_id
     LEFT JOIN tenant_profiles tp ON tp.unit_id = u.id
     LEFT JOIN payments pay ON pay.bill_id = b.id
     WHERE ${condition} GROUP BY b.id ORDER BY b.due_date DESC, b.id DESC`,
    [user.sub]
  );
  return result.rows;
}

module.exports = { createBill, listBills };