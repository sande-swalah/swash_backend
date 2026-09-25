const pool = require('../../../db');

async function createPayment({ billId, amount, provider, reference, tenantUserId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const billResult = await client.query(
      `SELECT b.id, b.amount, p.owner_id AS "ownerId"
       FROM bills b JOIN units u ON u.id = b.unit_id JOIN properties p ON p.id = u.property_id
       JOIN tenant_profiles tp ON tp.unit_id = u.id
       WHERE b.id = $1 AND tp.user_id = $2 FOR UPDATE`,
      [billId, tenantUserId]
    );
    const bill = billResult.rows[0];
    if (!bill) return null;

    const paidResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE bill_id = $1 AND status = 'confirmed'`,
      [billId]
    );
    const remaining = Number(bill.amount) - Number(paidResult.rows[0].total);
    if (Number(amount) > remaining) throw new Error('Payment exceeds bill balance');

    const paymentResult = await client.query(
      `INSERT INTO payments (bill_id, tenant_user_id, amount, provider, reference, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', current_timestamp)
       RETURNING id, bill_id AS "billId", amount, provider, reference, status, paid_at AS "paidAt"`,
      [billId, tenantUserId, amount, provider, reference || `PAY-${Date.now()}-${tenantUserId}`]
    );
    const newTotal = Number(paidResult.rows[0].total) + Number(amount);
    const status = newTotal >= Number(bill.amount) ? 'paid' : 'partially_paid';
    await client.query('UPDATE bills SET status = $1 WHERE id = $2', [status, billId]);
    await client.query(
      `INSERT INTO alerts (user_id, type, title, message) VALUES ($1, 'payment', 'Payment received', $2)`,
      [bill.ownerId, `Payment ${paymentResult.rows[0].reference} was recorded for bill #${billId}.`]
    );
    await client.query('COMMIT');
    return paymentResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listPayments(user) {
  const condition = user.role === 'tenant' ? 'pay.tenant_user_id = $1' : 'p.owner_id = $1';
  const result = await pool.query(
    `SELECT pay.id, pay.bill_id AS "billId", pay.amount, pay.provider, pay.reference,
            pay.status, pay.paid_at AS "paidAt", pay.created_at AS "createdAt"
     FROM payments pay JOIN bills b ON b.id = pay.bill_id JOIN units u ON u.id = b.unit_id
     JOIN properties p ON p.id = u.property_id WHERE ${condition} ORDER BY pay.id DESC`,
    [user.sub]
  );
  return result.rows;
}

module.exports = { createPayment, listPayments };