const pool = require('../../../db');

async function createRepair({ unitId, description, photos, userId }) {
  const result = await pool.query(
    `INSERT INTO repairs (unit_id, description, status, photos)
     SELECT $1, $2, 'pending', $3::jsonb WHERE EXISTS (
       SELECT 1 FROM tenant_profiles WHERE user_id = $4 AND unit_id = $1
     ) RETURNING id, unit_id AS "unitId", description, status, photos,
               cost, assigned_employee_id AS "assignedEmployeeId"`,
    [unitId, description, JSON.stringify(photos), userId]
  );
  return result.rows[0] || null;
}

async function listRepairs(user) {
  const condition = user.role === 'tenant'
    ? 'tp.user_id = $1'
    : user.role === 'employee'
      ? 'r.assigned_employee_id = $1'
      : 'p.owner_id = $1';
  const result = await pool.query(
        `SELECT r.id, r.unit_id AS "unitId", r.description, r.status, r.photos, r.cost,
          r.assigned_employee_id AS "assignedEmployeeId", u.unit_number AS "unitNumber"
     FROM repairs r JOIN units u ON u.id = r.unit_id JOIN properties p ON p.id = u.property_id
     LEFT JOIN tenant_profiles tp ON tp.unit_id = u.id
     WHERE ${condition} ORDER BY r.id DESC`,
    [user.sub]
  );
  return result.rows;
}

async function updateRepair({ id, status, assignedEmployeeId, ownerId }) {
  const result = await pool.query(
    `UPDATE repairs r SET status = $1, assigned_employee_id = $2
     FROM units u JOIN properties p ON p.id = u.property_id
     WHERE r.id = $3 AND r.unit_id = u.id AND p.owner_id = $4
       AND ($2 IS NULL OR EXISTS (
         SELECT 1 FROM employee_properties ep
         WHERE ep.employee_id = $2 AND ep.property_id = p.id
       ))
     RETURNING r.id, r.unit_id AS "unitId", r.description, r.status,
               r.assigned_employee_id AS "assignedEmployeeId", r.cost, r.photos`,
    [status, assignedEmployeeId || null, id, ownerId]
  );
  return result.rows[0] || null;
}

async function updateAssignedRepair({ id, status, employeeId }) {
  const result = await pool.query(
    `UPDATE repairs SET status = $1
     WHERE id = $2 AND assigned_employee_id = $3
     RETURNING id, unit_id AS "unitId", description, status, photos, cost,
               assigned_employee_id AS "assignedEmployeeId"`,
    [status, id, employeeId]
  );
  return result.rows[0] || null;
}

module.exports = { createRepair, listRepairs, updateRepair, updateAssignedRepair };