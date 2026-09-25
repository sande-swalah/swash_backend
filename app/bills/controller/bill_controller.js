const { createBillSchema } = require('../model/bill_schema');
const { createBill, listBills } = require('../model/bill_repo');

async function create(req, res) {
  const { error, value } = createBillSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const bill = await createBill({ ...value, ownerId: req.user.sub });
    return bill ? res.status(201).json({ bill }) : res.status(404).json({ message: 'Unit not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to create bill' });
  }
}

async function list(req, res) {
  try {
    return res.json({ bills: await listBills(req.user) });
  } catch (err) {
    return res.status(500).json({ message: 'Unable to load bills' });
  }
}

module.exports = { create, list };